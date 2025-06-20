# Етап 1: build
FROM node:20-alpine AS build

# Встановлення git
RUN apk add --no-cache git

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

RUN yarn build

# Етап 2: serve nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
