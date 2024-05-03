FROM node:18-alpine3.18

ARG CONNECT_SERVICE_URL
ENV CONNECT_SERVICE_URL=$CONNECT_SERVICE_URL

COPY . /app
WORKDIR /app/extension/

RUN npm install
RUN npm ci --only=prod
RUN npm run setup-resources || true
EXPOSE 8080
CMD [ "node", "src/init.js" ]