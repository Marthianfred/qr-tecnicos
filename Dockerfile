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
# build:client handles frontend, build:server handles backend (tsc)
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

# We use a shell command to find the correct main.js file
# This is more robust against tsc nesting everything in dist/src/
# We exclude 'dist/client' to avoid running the frontend main file by mistake
CMD ["sh", "-c", "MAIN_FILE=$(find dist -name main.js | grep -v client | head -n 1) && node $MAIN_FILE"]
