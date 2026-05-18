const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.AYALA_PORT || 3003;
const QUESTIONS_FILE = path.join(__dirname, "questions.json");

// ── Game State ────────────────────────────────────────────────────────────────
let gameState = {
  phase: "lobby", // lobby | question | scoreboard | podium
  players: {}, // { socketId: { nickname, score, answeredAt } }
  questions: [],
  currentQuestion: -1,
  questionStartTime: null,
  timer: null,
  timeLeft: 0,
};

function loadQuestions() {
  try {
    const raw = fs.readFileSync(QUESTIONS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveQuestions(questions) {
  fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2));
}

gameState.questions = loadQuestions();

// ── Helpers ───────────────────────────────────────────────────────────────────
function getScoreboard() {
  return Object.values(gameState.players)
    .map((p) => ({ nickname: p.nickname, score: p.score }))
    .sort((a, b) => b.score - a.score);
}

function broadcastLobby() {
  io.emit("lobby_update", {
    playerCount: Object.keys(gameState.players).length,
    players: Object.values(gameState.players).map((p) => p.nickname),
  });
}

function clearTimer() {
  if (gameState.timer) {
    clearInterval(gameState.timer);
    gameState.timer = null;
  }
}

function startQuestionTimer(questionTime) {
  clearTimer();
  gameState.timeLeft = questionTime;

  gameState.timer = setInterval(() => {
    gameState.timeLeft -= 1;
    io.emit("timer_tick", { timeLeft: gameState.timeLeft });

    if (gameState.timeLeft <= 0) {
      clearTimer();
      endQuestion();
    }
  }, 1000);
}

function endQuestion() {
  const q = gameState.questions[gameState.currentQuestion];
  // Reveal correct answer to all
  io.emit("question_ended", {
    correctIndex: q.correct,
    scoreboard: getScoreboard(),
  });
  gameState.phase = "scoreboard";
}

function sendQuestion() {
  const q = gameState.questions[gameState.currentQuestion];
  if (!q) return;

  // Reset answered state for this question
  Object.values(gameState.players).forEach((p) => {
    p.answeredAt = null;
    p.answeredCorrect = null;
  });

  gameState.phase = "question";
  gameState.questionStartTime = Date.now();

  const payload = {
    questionIndex: gameState.currentQuestion,
    total: gameState.questions.length,
    question: q.question,
    answers: q.answers,
    time: q.time,
  };

  io.emit("question_start", payload);
  startQuestionTimer(q.time);
}

// ── REST: questions CRUD ──────────────────────────────────────────────────────
app.get("/api/questions", (req, res) => {
  res.json(gameState.questions);
});

app.post("/api/questions", (req, res) => {
  const questions = req.body;
  if (!Array.isArray(questions)) return res.status(400).json({ error: "expected array" });
  gameState.questions = questions;
  saveQuestions(questions);
  res.json({ ok: true });
});

// ── REST: game state snapshot (for reconnecting guests) ───────────────────────
app.get("/api/state", (req, res) => {
  const q = gameState.questions[gameState.currentQuestion];
  res.json({
    phase: gameState.phase,
    currentQuestion: gameState.currentQuestion,
    total: gameState.questions.length,
    timeLeft: gameState.timeLeft,
    question: q
      ? {
          question: q.question,
          answers: q.answers,
          time: q.time,
          correct: gameState.phase === "scoreboard" ? q.correct : undefined,
        }
      : null,
    scoreboard: getScoreboard(),
    players: Object.values(gameState.players).map((p) => p.nickname),
  });
});

// ── REST: reset game ──────────────────────────────────────────────────────────
app.post("/api/reset", (req, res) => {
  clearTimer();
  gameState.phase = "lobby";
  gameState.currentQuestion = -1;
  gameState.questionStartTime = null;
  gameState.timeLeft = 0;
  Object.values(gameState.players).forEach((p) => {
    p.score = 0;
    p.answeredAt = null;
    p.answeredCorrect = null;
  });
  io.emit("game_reset");
  broadcastLobby();
  res.json({ ok: true });
});

// ── Socket.io ─────────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`[connect] ${socket.id}`);

  // Guest joins
  socket.on("join", ({ nickname }) => {
    if (!nickname || typeof nickname !== "string") return;
    const trimmed = nickname.trim().slice(0, 30);

    // Check duplicate
    const existing = Object.values(gameState.players).find(
      (p) => p.nickname === trimmed
    );
    if (existing) {
      // Reassign socket id (reconnect)
      const oldId = Object.keys(gameState.players).find(
        (k) => gameState.players[k].nickname === trimmed
      );
      if (oldId && oldId !== socket.id) {
        gameState.players[socket.id] = gameState.players[oldId];
        delete gameState.players[oldId];
      }
    } else {
      gameState.players[socket.id] = {
        nickname: trimmed,
        score: 0,
        answeredAt: null,
        answeredCorrect: null,
      };
    }

    console.log(`[join] ${trimmed}`);
    socket.emit("joined", { nickname: trimmed, score: gameState.players[socket.id]?.score || 0 });
    broadcastLobby();
  });

  // Guest answers
  socket.on("answer", ({ answerIndex }) => {
    const player = gameState.players[socket.id];
    if (!player) return;
    if (gameState.phase !== "question") return;
    if (player.answeredAt !== null) return; // already answered

    const q = gameState.questions[gameState.currentQuestion];
    if (!q) return;

    const elapsed = (Date.now() - gameState.questionStartTime) / 1000;
    const isCorrect = answerIndex === q.correct;
    player.answeredAt = elapsed;
    player.answeredCorrect = isCorrect;

    if (isCorrect) {
      const timeBonus = Math.max(0, (q.time - elapsed) / q.time);
      const points = Math.round(500 + 500 * timeBonus);
      player.score += points;
      socket.emit("answer_result", { correct: true, points, totalScore: player.score });
    } else {
      socket.emit("answer_result", { correct: false, points: 0, totalScore: player.score });
    }
  });

  // Host: start game
  socket.on("host_start", () => {
    if (gameState.questions.length === 0) return;
    gameState.currentQuestion = 0;
    sendQuestion();
  });

  // Host: next question
  socket.on("host_next", () => {
    clearTimer();
    gameState.currentQuestion += 1;
    if (gameState.currentQuestion >= gameState.questions.length) {
      gameState.phase = "podium";
      io.emit("game_over", { scoreboard: getScoreboard() });
    } else {
      sendQuestion();
    }
  });

  // Host: end question manually
  socket.on("host_end_question", () => {
    if (gameState.phase !== "question") return;
    clearTimer();
    endQuestion();
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log(`[disconnect] ${socket.id}`);
    // Keep player in state for reconnect — remove only their socket mapping
    // They'll reconnect with nickname cookie
  });
});

server.listen(PORT, () => {
  console.log(`Ayala Quiz Server running on port ${PORT}`);
});
