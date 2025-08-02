FROM node:22.16.0-alpine
WORKDIR /usr/xuxu
COPY --chown=node:node package*.json /usr/xuxu
RUN npm install
USER node


