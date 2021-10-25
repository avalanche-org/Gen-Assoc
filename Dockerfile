FROM  debian:latest  

MAINTAINER  "Umar" funscript@outlook.fr  

ARG node_version=17

RUN apt-get update -y  \
&& apt-get install curl -y  \
&& curl  -sL https://deb.nodesource.com/setup_$node_version.x | bash  \
&& apt-get install nodejs -y \
&& apt-get clean

ADD  .  ./Sandbox 
WORKDIR  /Sandbox/Apps/

RUN npm install && npm install -g  pm2

EXPOSE 4000 

VOLUME app/libs

CMD  ["pm2-runtime" , "mtdt_server.js"] 
