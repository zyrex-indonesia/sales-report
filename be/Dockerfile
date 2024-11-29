# Use a Node.js base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application files
COPY . .

COPY ./config ./config

# Expose the backend port
EXPOSE 5000

# Start the backend server
CMD ["npm", "start"]
