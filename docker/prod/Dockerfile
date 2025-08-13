# 1: Build
FROM node:20.17.0 AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# 2: Production
FROM node:20.17.0
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production --legacy-peer-deps
COPY --from=builder /usr/src/app/dist ./dist
CMD ["node", "dist/main.js"]


# docker-compose -f docker/prod/docker-compose.yml up --build
