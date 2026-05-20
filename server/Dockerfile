# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared types first (workspace dependency)
COPY shared/package.json ./shared/
COPY shared/src ./shared/src/

# Copy server package files
COPY server/package*.json ./server/

# Install Dependencies
WORKDIR /app/server
RUN npm ci

#Copy source
COPY server/src ./src/
COPY server/tsconfig.json ./

# Build
RUN npm run build

# ── Stage 2: Production ───────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Security: run as non-root user
RUN addgroup -S peoplepay && adduser -S peoplepay -G peoplepay

# Copy shared
COPY --from=builder /app/shared ./shared/

# Copy build server
COPY --from=builder /app/server/dist ./server/dist/
COPY --from=builder /app/server/node_modules ./server/node_modules/
COPY server/package.json ./server/

# Copy seed data
COPY server/src/utils/seed/data ./server/src/utils/seed/data

# Create data directory for SQLite
RUN mkdir -p /data && chown peoplepay:peoplepay /data

USER peoplepay

WORKDIR /app/server

ENV NODE_ENV=production
ENV DB_PATH=/data/peoplepay.DB_PATH
ENV PORT=3011

EXPOSE 3001

# Health check — Docker will mark container unhealthy if this fails
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "dist/index.js"]