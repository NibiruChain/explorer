FROM node:17-alpine as builder

WORKDIR /app
COPY . .
RUN yarn && yarn build

FROM nginx:alpine
COPY --from=builder /app/ping.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html