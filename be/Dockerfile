FROM node:20-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache openssl mysql-client

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Copy SQL dump for database seeding
COPY sistem_cpl.sql /app/sistem_cpl.sql

# Generate Prisma Client AFTER copying all files
RUN npx prisma generate

# Build TypeScript → menghasilkan folder dist/
RUN npm run build

EXPOSE 8002

# Start server from built JS
CMD ["node", "dist/server/index.js"]
