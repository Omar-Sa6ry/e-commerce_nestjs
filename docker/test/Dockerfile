FROM node:20.17.0

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 4002

CMD ["npm", "run", "start:test"]

# docker-compose -f docker/test/docker-compose.yml up --build