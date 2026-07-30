FROM node:20-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache openssl mysql-client

# Install PM2 globally for containerized cluster execution
RUN npm install -g pm2

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Generate Prisma Client AFTER copying all files
RUN npx prisma generate

# Build TypeScript -> menghasilkan folder dist/
RUN npm run build

EXPOSE 5000 8002

# Default command: Run PM2 cluster in foreground mode via pm2-runtime
CMD ["pm2-runtime", "start", "ecosystem.config.cjs"]
