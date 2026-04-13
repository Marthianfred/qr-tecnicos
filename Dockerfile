# Stage 1: Build
FROM node:20 AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
# Force install the specific rollup binary for Linux to avoid npm bug
RUN npm install @rollup/rollup-linux-x64-gnu
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
# Using full node:20 instead of slim to ensure native modules like bcrypt find all system libs
FROM node:20

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts

# Copy built files
COPY --from=build /app/dist ./dist

# Create uploads directory (ensure it's not deleted by ETL)
RUN mkdir -p /app/uploads

# Expose the application port
EXPOSE 3200

# Set environment variables
ENV NODE_ENV=production

# Direct entry point since we fixed tsconfig to prevent nesting
CMD ["node", "dist/main.js"]
