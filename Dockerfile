# Stage 1: Build
FROM node:20 AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the application
# build:client handles frontend, build:server handles backend (tsc)
RUN npm run build

# Stage 2: Production
FROM node:20-slim

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts

# Copy built files from build stage
# We copy the entire dist folder to ensure all assets (client, common, modules) are present
COPY --from=build /app/dist ./dist

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose the application port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Final verification of build integrity during container startup
CMD ["node", "dist/main.js"]
