FROM  node:17-alpine3.14

MAINTAINER  Umar  jUmar@protonmail.com <github/Jukoo>  


ARG  port=4000
ENV  PORT  $port   

RUN apk add R  

ADD  .  ./mTDT 
WORKDIR  /mTDT/apps/

RUN npm install && npm install -g  pm2

EXPOSE $port


CMD  ["pm2-runtime" , "mtdt_server.js"] 
