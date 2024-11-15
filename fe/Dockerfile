# Use a Node.js image for the frontend
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the frontend for production
RUN npm run build

# Expose the frontend port
EXPOSE 3000

# Start the frontend server
CMD ["npm", "start"]
