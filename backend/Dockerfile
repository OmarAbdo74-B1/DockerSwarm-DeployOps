FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN addgroup -S app && adduser -S -g app app
USER app
EXPOSE 3000
CMD ["node", "server.js"]