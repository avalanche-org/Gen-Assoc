FROM  node:17-alpine3.14

MAINTAINER  "Umar  <github/jukoo>" funscript@outlook.fr  

ADD  .  ./Sandbox 
WORKDIR  /Sandbox/apps/

RUN npm install && npm install -g  pm2

EXPOSE 4000 

VOLUME app/libs

CMD  ["pm2-runtime" , "mtdt_server.js"] 
