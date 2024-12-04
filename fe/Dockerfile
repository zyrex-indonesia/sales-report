# Stage 1: Build the React/Next.js app
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the application
RUN npm run build
RUN npm run export

# Stage 2: Serve the app using Nginx
FROM nginx:alpine

# Copy the built files from the previous stage to the Nginx web root
COPY --from=build /app/out /usr/share/nginx/html

# Remove the default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Add a custom Nginx configuration
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for serving the application
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
