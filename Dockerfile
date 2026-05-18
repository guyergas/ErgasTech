# Stage 1: install dependencies
FROM node:20 AS deps
WORKDIR /app
# sharp requires platform-specific native build
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package.json ./
RUN npm install

# Stage 2: build
FROM node:20 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Placeholder so build doesn't fail — real key injected at runtime
ENV ANTHROPIC_API_KEY=placeholder
RUN npm run build

# Stage 3: production runtime
FROM node:20 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Install Python and system dependencies for Whisper
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-pip ffmpeg && rm -rf /var/lib/apt/lists/*

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy Next.js standalone output
RUN mkdir -p /app/public /app/.next /app/public/trip/uploads /data/trip
COPY --from=builder /app/.next/standalone /app/
COPY --from=builder /app/.next/static /app/.next/static
COPY --from=builder /app/public /app/public

# Install runtime deps into standalone node_modules
RUN npm install --prefix /app socket.io@4.7.4 @anthropic-ai/sdk nanoid sharp leaflet --no-save

# Install Faster-Whisper (optimized, lightweight)
# Faster-Whisper uses ONNX runtime (no torch needed) and CTransformers for speed
RUN pip install faster-whisper numpy scipy --break-system-packages

# Copy custom server
COPY --from=builder /app/custom-server.js /app/custom-server.js

# Ensure proper permissions
RUN chown -R nextjs:nodejs /app /data

USER nextjs
EXPOSE 3000

CMD ["node", "/app/custom-server.js"]
