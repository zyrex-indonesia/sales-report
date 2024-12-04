FROM node:18.17.0-alpine as BUILD_IMAGE
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production

FROM node:18.17.0-alpine
WORKDIR /app
COPY --from=BUILD_IMAGE /app/package.json ./package.json
COPY --from=BUILD_IMAGE /app/node_modules ./node_modules
COPY --from=BUILD_IMAGE /app/.next ./.next
COPY --from=BUILD_IMAGE /app/public ./public
COPY --from=BUILD_IMAGE /app/next.config.mjs ./
EXPOSE 80
CMD ["npm", "start"]
