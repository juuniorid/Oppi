FROM node:24-alpine

WORKDIR /app

# Install netcat for database health checks
RUN apk add --no-cache netcat-openbsd

# Install pnpm
RUN npm install -g pnpm

COPY package*.json pnpm-lock.yaml ./
RUN pnpm install

# Copy all source files, config, and scripts
COPY . .

EXPOSE 3001

ENTRYPOINT ["sh", "/app/entrypoint.sh"]
CMD ["pnpm", "run", "start:prod"]
