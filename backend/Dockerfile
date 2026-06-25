FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++ openssl openssl-dev

COPY package.json ./
COPY prisma ./prisma

RUN npm install --registry https://registry.npmmirror.com

COPY . .
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 4000
ENTRYPOINT ["./docker-entrypoint.sh"]
