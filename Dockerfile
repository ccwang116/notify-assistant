FROM node:18-alpine

WORKDIR /

COPY . .

RUN npm ci --only=production

CMD [ "npm", "start" ]
