# Build stage
FROM node:18-alpine as build

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app files
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy build files to NGINX's default directory
COPY --from=build /usr/src/app/build /usr/share/nginx/html

# Expose the default port
EXPOSE 80
