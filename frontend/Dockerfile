# Stage 1 — Build step
FROM node:20-alpine AS build
WORKDIR /app

# Copy dependency files
COPY package*.json ./
RUN npm install

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL


# Copy source code
COPY . .

# Build production bundle
RUN npm run build

# Stage 2 — Serve static via lightweight HTTP server
FROM node:20-alpine
WORKDIR /app

# Copy built files from build stage
COPY --from=build /app/dist ./dist

# Install 'serve' globally
RUN npm install -g serve

# Expose port 80 for Traefik to access
EXPOSE 80

# Default command
CMD ["serve", "-s", "dist", "-l", "80"]
