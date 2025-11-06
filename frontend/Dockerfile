FROM node:20-slim

WORKDIR /app

RUN npm install -g serve

COPY . .

EXPOSE 5000

CMD ["serve", "-s", ".", "-l", "5000"]