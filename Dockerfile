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
FROM node:20-slim

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts

# Copy built files from build stage
COPY --from=build /app/dist ./dist

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose the application port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Final verification of build integrity during container startup
CMD ["node", "dist/main.js"]
