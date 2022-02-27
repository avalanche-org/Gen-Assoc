FROM  node:17-alpine3.14

MAINTAINER  Umar  jUmar@protonmail.com <github/Jukoo>  

ARG  port=4000                                  #   Default  port  is set to  4000  
ARG  plink_build_version="20210606"             #   Default  Plink  Build Release  
ARG  plink_filename="plink_linux_x86_64_${plink_build_version}"  # Plink File name 

# See https://www.cog-genomics.org/plink/  
# on  Binary Download section

ARG  plink_bin="https://s3.amazonaws.com/plink1-assets/${plink_filename}.zip" 

ENV  PORT  $port   
RUN apk add R

ADD  .  ./mTDT 
WORKDIR  /mTDT/apps/
RUN wget $plink_bin  -P /bin && unzip  "/bin/${plink_filename}"   

RUN npm install && npm install -g  pm2

EXPOSE $port


CMD  ["pm2-runtime" , "mtdt_server.js"] 
