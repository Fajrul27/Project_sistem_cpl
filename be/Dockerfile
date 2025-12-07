FROM node:20-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Generate Prisma Client AFTER copying all files
RUN npx prisma generate

# Build TypeScript → menghasilkan folder dist/
RUN npm run build

EXPOSE 3000

# Start server from built JS
CMD ["node", "dist/server/index.js"]
