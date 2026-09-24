FROM node:20

# Без аргументов берутся значения из .env.production
ARG API_HOST
ARG NEXT_PUBLIC_HOST
ARG TURNSTILE_SITE_KEY

WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .

# Заданные build args пишем в .env.production.local: он перекрывает .env.production
# и читается не только при сборке, но и при `next start`
RUN for name in API_HOST NEXT_PUBLIC_HOST TURNSTILE_SITE_KEY; do \
      value=$(printenv "$name" || true); \
      if [ -n "$value" ]; then echo "$name=$value" >> .env.production.local; fi; \
    done

RUN npm run build
EXPOSE 3000
CMD npm run start
