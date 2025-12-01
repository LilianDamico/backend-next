# ===========================
# 1) STAGE DE BUILD
# ===========================
FROM node:18-slim AS builder

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build


# ===========================
# 2) STAGE DE PRODUÇÃO
# ===========================
FROM node:18-slim AS production

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./
RUN npm install --omit=dev

# Copia dist
COPY --from=builder /app/dist ./dist

# Copia schema
COPY --from=builder /app/prisma ./prisma

# Copia prisma client COMPLETO
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 8080

CMD ["node", "dist/index.js"]
