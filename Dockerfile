FROM node:12-alpine
EXPOSE 3000

RUN mkdir /home/node/app/ && chown -R node:node /home/node/app
WORKDIR /home/node/app

COPY --chown=node:node package*.json ./
USER node
RUN npm install --only=prod && npm cache clean --force --loglevel=error

COPY --chown=node:node . /home/node/app
ENV NODE_ENV production

CMD [ "node", "index.js" ]
