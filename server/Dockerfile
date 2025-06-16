FROM node:18-alpine

# Set working directory
WORKDIR /app/server

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
