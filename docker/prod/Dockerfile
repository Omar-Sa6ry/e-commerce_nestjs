FROM node:20.17.0

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production --legacy-peer-deps

COPY . .

RUN npm run build

EXPOSE 4002

CMD ["npm", "run", "start:prod"]


# docker-compose -f docker/prod/docker-compose.yml up --build
