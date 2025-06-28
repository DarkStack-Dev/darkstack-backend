# Dockerfile
FROM node:22-alpine

WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Regenerar Prisma Client para Linux Alpine
RUN npx prisma generate

# Build da aplicação
RUN npm run build

# Expor porta
EXPOSE 3001

# Comando para iniciar
CMD ["npm", "run", "start:prod"]

# Script para executar migrations e iniciar app
CMD sh -c "npx prisma migrate deploy && npm run start:prod"