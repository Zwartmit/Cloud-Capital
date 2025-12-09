# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package.json and lockfile
COPY package*.json ./

# Copy packages package.json
COPY packages/backend/package.json ./packages/backend/
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies (including devDependencies for building)
RUN npm install

# Copy source code
COPY packages/backend ./packages/backend
COPY packages/shared ./packages/shared
COPY packages/database ./packages/database

# Generate Prisma Client
WORKDIR /app/packages/database
RUN npx prisma generate

# Build backend
WORKDIR /app/packages/backend
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package.json and lockfile
COPY package*.json ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/

# Install only production dependencies
RUN npm install --omit=dev && \
    apk add --no-cache openssl

# Copy built artifacts from builder
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

WORKDIR /app/packages/backend

EXPOSE 3000

CMD ["node", "dist/server.js"]
