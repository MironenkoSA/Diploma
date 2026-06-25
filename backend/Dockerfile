# syntax=docker/dockerfile:1
FROM node:20-alpine

WORKDIR /app

# Нативные зависимости для argon2 + OpenSSL для Prisma
RUN apk add --no-cache python3 make g++ openssl openssl-dev

# Копируем schema.prisma ДО npm install
# (нужна для prisma generate который запускается в postinstall)
COPY package.json ./
COPY prisma ./prisma

# Устанавливаем все зависимости включая devDeps (ts-node, typescript)
# --mount=type=cache ускоряет повторные сборки
RUN --mount=type=cache,target=/root/.npm \
    npm install

# Копируем весь исходный код
COPY . .

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 4000
ENTRYPOINT ["./docker-entrypoint.sh"]
