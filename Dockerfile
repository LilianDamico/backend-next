FROM node:18-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 8080

CMD ["node", "dist/index.js"]
