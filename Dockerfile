#  GEN ASSOC 
#  ---------
# A generic docker image to run the Gen Assoc application 
# this docker image is based on node:alpine  
# see on https://hub.docker.com/_/node  
# however the application requires <plink> and the <R language>
# to run the scripts. 
# Parameters have been defined to facilitate the build by the user  
# to modify the parameters we do it during the build of the image   
# example  
# -> docker build .   --build-arg port=<numPort> 
# all lines with <ARG> in front can be modified during the build 
#-------------------------------------------------------------------

ARG   NAPL_V=17-alpine3.14

FROM  node:$NAPL_V

MAINTAINER  Umar  jUmar@protonmail.com <github/Jukoo>  

ARG  port=4000                                  #   Default  port  is set to  4000  
ARG  plink_build_version="20210606"             #   Default  Plink  Build Release  
ARG  plink_filename="plink_linux_x86_64_${plink_build_version}"  # Plink File name 

# See https://www.cog-genomics.org/plink/   on  Binary Download section 
# To change the build, you can do -build-arg plink_build_version=<numberOfBuild> 

ARG  plink_bin="https://s3.amazonaws.com/plink1-assets/${plink_filename}.zip" 

ENV  PORT  $port   
RUN apk add R

ADD  .  ./mTDT 
WORKDIR  /mTDT/apps/

###  EXTRACT  PLINK EXEC  TO CURRENT BIN FOLDER  
RUN mkdir  bin
RUN wget $plink_bin -P bin/  
RUN cd bin/ && unzip $plink_filename.zip && rm $plink_filename.zip
RUN cd ../

RUN npm install && npm install -g  pm2

EXPOSE $port

CMD  ["pm2-runtime" , "mtdt_server.js"] 
