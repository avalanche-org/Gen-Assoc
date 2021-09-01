FROM debian:latest

MAINTAINER  "Umar" funscript@outlook.fr  

ARG node_version=16

RUN apt-get update -y  \
&& apt-get install curl -y  \
&& curl  -sL https://deb.nodesource.com/setup_$node_version.x | bash  \
&& apt-get install nodejs -y \
&& apt-get clean


ADD  .  ./app
WORKDIR  /app/Gaui/

RUN npm install && npm install -g  pm2

EXPOSE 4000 

VOLUME app/libs

CMD  ["pm2-runtime" , "wtcp.js"] 
