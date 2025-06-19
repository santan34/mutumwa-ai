FROM node:18-alpine

# Set working directory
WORKDIR /app/collector

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Expose port
EXPOSE 8888

# Start the application
CMD ["npm", "start"]