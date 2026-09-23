FROM node:20

ARG API_HOST=https://api.appstoria.by
ARG NEXT_PUBLIC_HOST=https://appstoria.by
ARG TURNSTILE_SITE_KEY=

WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .

ENV API_HOST=$API_HOST \
    NEXT_PUBLIC_HOST=$NEXT_PUBLIC_HOST \
    TURNSTILE_SITE_KEY=$TURNSTILE_SITE_KEY

RUN npm run build
EXPOSE 3000
CMD npm run start
