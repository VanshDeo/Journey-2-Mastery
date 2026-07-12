# ============================================
# Stage 1: Build stage
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install all dependencies (including devDependencies for compilation)
RUN npm ci

# Copy application source code
COPY tsconfig.json ./
COPY src/ ./src/

# Compile TypeScript to JavaScript
RUN npm run build

# Remove development dependencies to keep production image small
RUN npm prune --production

# ============================================
# Stage 2: Production runtime stage
# ============================================
FROM node:20-alpine AS runner

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
CMD ["npm", "run", "start"]
