# =====================================================
# 🔥 DOCKERFILE PARA BACKEND NODE + PRISMA + EXPRESS
# =====================================================

FROM node:18-slim

WORKDIR /app

# Copia apenas package.json primeiro para aproveitar cache em builds
COPY package*.json ./

# ---- Instala dependências sem dev (mais leve em produção)
RUN npm install --omit=dev

# Agora copia o código do projeto
COPY . .

# 🔥 Gera Prisma Client no container
RUN npx prisma generate

# Compila o TS para JS
RUN npm run build

# Porta do container (a mesma do .env → 8080)
EXPOSE 8080

# 🚀 Start
CMD ["npm", "start"]
