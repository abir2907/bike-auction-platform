# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Prisma on Alpine needs OpenSSL present to pick the correct query engine.
RUN apk add --no-cache openssl

# Install deps (including dev) using the lockfile for reproducible builds.
COPY package*.json ./
RUN npm ci

# Generate the Prisma client, then compile TypeScript to dist/.
COPY prisma ./prisma
RUN npx prisma generate
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Drop dev dependencies to slim the runtime image. `prisma` is a runtime
# dependency (used by `migrate deploy` on boot), so it survives the prune.
RUN npm prune --omit=dev

# ── Runtime stage ────────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache openssl

# Run as a non-root user.
RUN addgroup -S app && adduser -S app -G app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package*.json ./

# Give the non-root user ownership so Prisma can read its engines (and write
# any cache it needs) at runtime — fixes "Can't write to @prisma/engines".
RUN chown -R app:app /app
USER app
EXPOSE 4000

# Apply pending migrations, then start the server.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
