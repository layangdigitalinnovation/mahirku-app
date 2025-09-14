FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies including devDependencies for TypeScript compilation
RUN npm install

# Copy the rest of the application code
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Expose the port the app runs on
EXPOSE 5000

# Make entrypoint script executable
RUN chmod +x ./docker-entrypoint.sh

# Set entrypoint script
ENTRYPOINT ["./docker-entrypoint.sh"]

# Start the application
CMD ["npm", "run", "start:prod"]
