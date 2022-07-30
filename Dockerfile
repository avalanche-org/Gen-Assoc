# Dockerfile  for GEN ASSOC 
# copyright  (c) 2022 , Umar <jUmarB@protonmail.com>  
# -----------------------------------------------------------------
# GEN ASSOC 
#  ---------
# A generic docker image to run the Gen Assoc application 
# this docker image is based on node: container   
# see on https://hub.docker.com/_/node  
# however the application requires <plink> and the <R language>
# to run the scripts. 
# Parameters have been defined to facilitate the build by the user  
# to modify the parameters we do it during the build of the image   
# example  
# -> docker build .   --build-arg port=<numPort> 
# all lines with <ARG> in front can be modified during the build 
#-------------------------------------------------------------------

ARG  DEBUGMOD=FALSE 

FROM  jukoo/m-tdt:headessentials 

MAINTAINER  Umar  jUmarB@protonmail.com <github/Jukoo>  

RUN  if [  -z $DEBUGMOD  ] ;then \
apt install  rsync  sshfs vim --assume-yes ;\
fi

WORKDIR   / 

ADD  . /mTDT

WORKDIR /mTDT/apps

RUN npm install && npm install -g  pm2
RUN npm audit  fix --force   

#HINT : DEFAULT PORT USED IS 4000  BY  MODIFYING  THE ENV $PORT  
#       YOU NEED  TO SPECIFY  THE  '-e' ON DOCKER COMMAND LAUNCHER 
#       docker  run -d  -e PORT=<portvalue>  -p<hostPort>:<portvalue>  jukoo/m-tdt 
ENV PORT=4000 

EXPOSE $PORT 

CMD  ["pm2-runtime" , "mtdt_server.js"] 
