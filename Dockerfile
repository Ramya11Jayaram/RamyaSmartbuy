# base image
FROM node:10-alpine as build-step

RUN mkdir -p /smartbuy/web

# set working directory

WORKDIR /smartbuy/web

# install and cache app dependencies
COPY package.json /smartbuy/web

RUN npm install

COPY . /smartbuy/web

RUN npm run build --prod

# Stage 2
FROM nginx:1.17.1-alpine
COPY --from=build-step /smartbuy/web/dist/c360-app /usr/share/nginx/html



