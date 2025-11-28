FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy prisma directory
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript code (optional, but good for production)
RUN npm run build

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "start"]
