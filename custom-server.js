// custom-server.js — Next.js standalone + Socket.io game server
const { createServer } = require("http");
const { parse } = require("url");
const next = require("./node_modules/next");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "3000", 10);
const QUESTIONS_FILE = path.join(__dirname, "public", "ayala", "questions.json");

// ── Next.js app ───────────────────────────────────────────────────────────────
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

// ── Questions ─────────────────────────────────────────────────────────────────
function loadQuestions() {
  try {
    return JSON.parse(fs.readFileSync(QUESTIONS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function saveQuestions(questions) {
  fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2));
}

// ── Game state ────────────────────────────────────────────────────────────────
function newGameId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

let state = {
  gameId: newGameId(),   // changes on every reset — clients use this to detect stale cookies
  phase: "lobby",       // lobby | question | scoreboard | podium
  players: {},          // socketId → { nickname, score, answered }
  questions: loadQuestions(),
  globalTime: 20,       // seconds per question (global setting)
  currentQuestion: -1,
  questionStartTime: null,
  timeLeft: 0,
  timerInterval: null,
};

function resetState() {
  clearInterval(state.timerInterval);
  state.gameId = newGameId();  // new ID invalidates all existing cookies
  state.phase = "lobby";
  state.players = {};
  state.currentQuestion = -1;
  state.questionStartTime = null;
  state.timeLeft = 0;
  state.timerInterval = null;
  // Keep state.questions as-is — questions are only reloaded on server start
  // or explicitly saved via save_questions
}

function scoreboard() {
  return Object.values(state.players)
    .filter(p => !p.isHost)
    .map(p => ({ nickname: p.nickname, score: p.score }))
    .sort((a, b) => b.score - a.score);
}

function broadcastLobby(io) {
  const players = Object.values(state.players)
    .filter(p => !p.isHost)
    .map(p => p.nickname);
  io.emit("lobby_update", { playerCount: players.length, players, questionCount: state.questions.length });
}

function endQuestion(io) {
  clearInterval(state.timerInterval);
  state.timerInterval = null;
  const q = state.questions[state.currentQuestion];
  state.phase = "scoreboard";
  io.emit("question_ended", { correctIndex: q.correct, scoreboard: scoreboard() });
}

function startQuestionTimer(io, totalTime) {
  clearInterval(state.timerInterval);
  state.timeLeft = totalTime;
  state.timerInterval = setInterval(() => {
    state.timeLeft -= 1;
    io.emit("timer_tick", { timeLeft: state.timeLeft });
    if (state.timeLeft <= 0) endQuestion(io);
  }, 1000);
}

function sendQuestion(io) {
  const q = state.questions[state.currentQuestion];
  if (!q) return;

  // reset answered flag and lastCorrect
  Object.values(state.players).forEach(p => { p.answered = false; p.lastCorrect = false; });

  state.phase = "question";
  state.questionStartTime = Date.now();

  io.emit("question_start", {
    questionIndex: state.currentQuestion,
    total: state.questions.length,
    question: q.question,
    answers: q.answers,
    time: state.globalTime,
  });

  startQuestionTimer(io, state.globalTime);
}

const UPLOADS_DIR = path.join(__dirname, "public", "trip", "uploads");

// ── Boot ──────────────────────────────────────────────────────────────────────
app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    // Serve uploaded files directly from the volume-mounted directory
    if (parsedUrl.pathname.startsWith("/trip/uploads/")) {
      const filename = path.basename(parsedUrl.pathname);
      const filePath = path.join(UPLOADS_DIR, filename);
      fs.stat(filePath, (err, stat) => {
        if (err || !stat.isFile()) {
          handle(req, res, parsedUrl);
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        const mime = {
          ".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
          ".png": "image/png", ".gif": "image/gif",
          ".mp4": "video/mp4", ".mov": "video/quicktime",
          ".webm": "audio/webm", ".ogg": "audio/ogg", ".m4a": "audio/mp4", ".mp3": "audio/mpeg",
        }[ext] || "application/octet-stream";
        res.writeHead(200, { "Content-Type": mime, "Content-Length": stat.size, "Cache-Control": "public, max-age=31536000" });
        fs.createReadStream(filePath).pipe(res);
      });
      return;
    }
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: { origin: "*" },
    path: "/ayala-socket",
  });

  io.on("connection", (socket) => {
    console.log(`[connect] ${socket.id}`);
    // Send current gameId immediately so client can validate its cookie
    socket.emit("game_id", { gameId: state.gameId });

    // ── Guest join ──────────────────────────────────────────────────────────
    socket.on("join", ({ nickname }) => {
      if (!nickname) return;
      const nick = String(nickname).trim().slice(0, 30);
      if (nick === "__host__") return;

      // find if nickname already exists (reconnect)
      const existingId = Object.keys(state.players).find(
        id => state.players[id].nickname === nick && !state.players[id].isHost
      );
      if (existingId && existingId !== socket.id) {
        state.players[socket.id] = state.players[existingId];
        delete state.players[existingId];
      } else if (!state.players[socket.id]) {
        state.players[socket.id] = { nickname: nick, score: 0, answered: false, isHost: false };
      }

      const player = state.players[socket.id];
      socket.emit("joined", { nickname: player.nickname, score: player.score, questionCount: state.questions.length, gameId: state.gameId });
      broadcastLobby(io);

      // if game already running, send current state so they can rejoin
      if (state.phase === "question") {
        const q = state.questions[state.currentQuestion];
        socket.emit("question_start", {
          questionIndex: state.currentQuestion,
          total: state.questions.length,
          question: q.question,
          answers: q.answers,
          time: state.globalTime,
          timeLeft: state.timeLeft,
        });
      } else if (state.phase === "scoreboard") {
        socket.emit("question_ended", {
          correctIndex: state.questions[state.currentQuestion]?.correct,
          scoreboard: scoreboard(),
        });
      } else if (state.phase === "podium") {
        socket.emit("game_over", { scoreboard: scoreboard() });
      }
    });

    // ── Host join ───────────────────────────────────────────────────────────
    socket.on("host_join", () => {
      state.players[socket.id] = { nickname: "__host__", score: 0, answered: false, isHost: true };
      // send current questions
      socket.emit("questions_loaded", { questions: state.questions, globalTime: state.globalTime });
      broadcastLobby(io);
    });

    // ── Guest answer ────────────────────────────────────────────────────────
    socket.on("answer", ({ answerIndex }) => {
      const player = state.players[socket.id];
      if (!player || player.isHost) return;
      if (state.phase !== "question") return;
      if (player.answered) return;

      const q = state.questions[state.currentQuestion];
      if (!q) return;

      player.answered = true;
      const elapsed = (Date.now() - state.questionStartTime) / 1000;
      const isCorrect = answerIndex === q.correct;

      // count how many players already answered correctly before this one
      const correctBefore = Object.values(state.players)
        .filter(p => !p.isHost && p.answered && p !== player && p.lastCorrect)
        .length;

      if (isCorrect) {
        const timeBonus = Math.max(0, (state.globalTime - elapsed) / state.globalTime);
        const points = Math.round(500 + 500 * timeBonus);
        player.score += points;
        player.lastCorrect = true;
        const timeTaken = Math.round(elapsed * 10) / 10; // 1 decimal
        const rankAmongCorrect = correctBefore + 1; // 1-based
        socket.emit("answer_result", { correct: true, points, totalScore: player.score, timeTaken, rankAmongCorrect });
      } else {
        player.lastCorrect = false;
        socket.emit("answer_result", { correct: false, points: 0, totalScore: player.score });
      }

      // broadcast updated answered count to host
      const guests = Object.values(state.players).filter(p => !p.isHost);
      const answeredCount = guests.filter(p => p.answered).length;
      io.to(Array.from(io.sockets.sockets.keys()).find(id => state.players[id]?.isHost) || '').emit('player_answered', { answeredCount });

      if (guests.length > 0 && guests.every(p => p.answered)) {
        // Delay so the last answerer's answer_result renders before question_ended overwrites it
        setTimeout(() => endQuestion(io), 2000);
      }
    });

    // ── Host controls ───────────────────────────────────────────────────────
    socket.on("host_start", () => {
      if (state.questions.length === 0) return;
      state.currentQuestion = 0;
      sendQuestion(io);
    });

    socket.on("host_next", () => {
      clearInterval(state.timerInterval);
      state.currentQuestion += 1;
      if (state.currentQuestion >= state.questions.length) {
        state.phase = "podium";
        io.emit("game_over", { scoreboard: scoreboard() });
        // Auto-reset 60 seconds after game over so guests can leave the podium screen
        setTimeout(() => {
          if (state.phase === "podium") {
            resetState();
            io.emit("game_reset", { gameId: state.gameId });
            broadcastLobby(io);
          }
        }, 60000);
      } else {
        sendQuestion(io);
      }
    });

    socket.on("host_end_question", () => {
      if (state.phase === "question") endQuestion(io);
    });

    socket.on("host_reset", () => {
      resetState();
      io.emit("game_reset", { gameId: state.gameId });
      broadcastLobby(io);
    });

    // ── Questions CRUD (host) ───────────────────────────────────────────────
    socket.on("save_questions", ({ questions, globalTime }) => {
      if (!Array.isArray(questions)) return;
      state.questions = questions;
      if (globalTime && typeof globalTime === "number") state.globalTime = globalTime;
      saveQuestions(questions);
      socket.emit("questions_saved", { ok: true });
    });

    // ── Disconnect ──────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      console.log(`[disconnect] ${socket.id}`);
      // keep player for reconnect — don't delete on disconnect
    });
  });

  httpServer.listen(port, "0.0.0.0", () => {
    console.log(`> Ready on http://0.0.0.0:${port}`);
  });
});
