FROM node:18.20.2  
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --legacy-peer
COPY . .
CMD ["npm", "run", "start:dev"]