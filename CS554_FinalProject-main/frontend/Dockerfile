FROM node:20-alpine

WORKDIR /app


ENV PORT=3001
ENV HOST=0.0.0.0


COPY package*.json ./


RUN npm install


COPY . .


EXPOSE 3001


CMD ["npm", "start"]

