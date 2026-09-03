# syntax=docker/dockerfile:1
FROM node:22-slim AS client-builder

WORKDIR /app
COPY client/package*.json ./client/
RUN cd client && npm ci

COPY client/ ./client/
RUN cd client && npm run build

FROM node:22-slim AS server

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

COPY --from=client-builder /app/client/dist /app/client/dist
COPY server/ ./server/

# Generate Prisma client
RUN npx prisma generate

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server/app.js"]
