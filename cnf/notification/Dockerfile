FROM node:18-alpine3.18

ARG CONNECT_SERVICE_URL_NOTIFICATION
ENV CONNECT_SERVICE_URL_NOTIFICATION=$CONNECT_SERVICE_URL_NOTIFICATION

COPY . /app
WORKDIR /app/notification/

RUN npm install
RUN npm ci --only=prod
RUN npm run setup-resources || true
EXPOSE 8443
CMD [ "node", "src/init.js" ]