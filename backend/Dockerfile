FROM node:18-alpine

WORKDIR /app

# Copy package.json & install deps
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Compile TypeScript
RUN npm run build

# Install bash + convert line endings + chmod
RUN apk add --no-cache bash dos2unix \
    && dos2unix docker-entrypoint.sh wait-for-it.sh \
    && chmod +x docker-entrypoint.sh wait-for-it.sh

EXPOSE 5000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
