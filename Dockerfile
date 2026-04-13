# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies and build tools for native modules
RUN apk add --no-cache libc6-compat

COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts

# Copy built files from build stage
COPY --from=build /app/dist ./dist

# Expose the application port
EXPOSE 3000

# Set environment variables (defaults, can be overridden)
ENV NODE_ENV=production
ENV DB_HOST=localhost
ENV DB_PORT=5432
ENV DB_USER=postgres
ENV DB_PASSWORD=postgres
ENV DB_NAME=fibex_qr
ENV REDIS_HOST=localhost
ENV REDIS_PORT=6379

# Use the fixed start script (we will update package.json to point to dist/main.js)
CMD ["npm", "run", "start"]
