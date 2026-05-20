# ── Stage 1: Build React app ──────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared types
COPY shared/package.json ./shared/
COPY shared/src           ./shared/src/

# Copy client
COPY client/package*.json ./client/

WORKDIR /app/client
RUN npm ci

COPY client/ ./

# Build — Vite outputs to dist/
RUN npm run build

# ── Stage 2: Serve with Nginx ─────────────────────────────────────────────────
FROM nginx:alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our nginx config
COPY client/nginx.conf /etc/nginx/conf.d/

# Copy built React app
COPY --from=builder /app/client/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]