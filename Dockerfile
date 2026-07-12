# ============================================
# Stage 1: Build stage
# ============================================
FROM node:20-slim AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install all dependencies (including devDependencies for compilation)
RUN npm ci --legacy-peer-deps

# Copy application source code and tsconfig
COPY tsconfig.server.json ./
COPY server/ ./server/

# Compile Hono backend TypeScript to JavaScript
RUN npm run build:backend

# Remove development dependencies to keep production image small
RUN npm prune --production

# ============================================
# Stage 2: Production runtime stage
# ============================================
FROM node:20-slim AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy built code and production node_modules from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 3000

# Default command runs the API server.
# Can be overridden in docker-compose for the background worker.
CMD ["npm", "run", "start:backend"]
