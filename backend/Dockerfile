FROM node:18-alpine3.18
WORKDIR /opt/app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production
ENV NODE_ENV=prod
EXPOSE 5000
CMD ["node", "./dist/src/main.js"]
