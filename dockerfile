FROM node:18-slim

ENV NODE_ENV production

WORKDIR /opt/enviro
COPY dist /opt/enviro/

CMD node index.js
EXPOSE 80