FROM node:22-alpine AS client-builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY client/package.json ./client/
COPY server/package.json ./server/
RUN pnpm install --frozen-lockfile --filter tv-dinner-client...
COPY client/ ./client/
RUN pnpm --filter tv-dinner-client build

FROM node:22-alpine AS production
RUN apk add --no-cache python3 make g++ vips-dev
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY server/package.json ./server/
COPY client/package.json ./client/
RUN pnpm install --frozen-lockfile --filter tv-dinner-server... --prod
COPY server/ ./server/
COPY --from=client-builder /app/client/dist ./client/dist
RUN mkdir -p ./server/data ./server/uploads
EXPOSE 3000
ENV NODE_ENV=production NODE_NO_WARNINGS=1 PORT=3000
CMD ["node", "server/index.js"]
