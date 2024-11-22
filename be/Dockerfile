# Use a Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy application files
COPY . .

# Expose the backend port
EXPOSE 5000

# Run the backend server
CMD ["npm", "start"]
