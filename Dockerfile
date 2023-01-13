## StAGE 1: Node setup
FROM node:16 as builder

COPY json_faucet /json_faucet

WORKDIR /json_faucet

RUN npm install
RUN npm install pm2 -g
RUN pm2 start json_faucetscript.js

## STAGE 2: Nginx setup
FROM nginx

COPY assets/ /var/www/html/
COPY index.html /var/www/html/

EXPOSE 80 6060 443
