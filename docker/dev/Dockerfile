FROM node:20.17.0

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

CMD ["npm", "run", "start:dev"]

# docker-compose -f docker/dev/docker-compose.yml up --build