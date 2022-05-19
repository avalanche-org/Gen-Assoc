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

ARG   BASE_NODE_VERSION=17
ARG   CODENAME=bullseye 

ARG   DIST=${BASE_NODE_VERSION}-${CODENAME}  

FROM  node:$DIST

MAINTAINER  Umar  jUmarB@protonmail.com <github/Jukoo>  

# Default  plink  Build Release  
ARG  plink_build_version="20210606"     

# Plink source Basename   
ARG  plink_filename="plink_linux_x86_64_${plink_build_version}"  

# See https://www.cog-genomics.org/plink/   on  Binary Download section 
# To change the build, you can do -build-arg plink_build_version=<numberOfBuild> 
ARG  plink_bin="https://s3.amazonaws.com/plink1-assets/${plink_filename}.zip" 

### UPDATE  CORE PACKAGES
RUN apt update  --assume-yes  
RUN apt install git --assume-yes && apt install r-base r-base-dev --assume-yes 

# R LIB LOCATION IN HOST
# You can change it and adapt to R lib location  if you have  R command available 
# R 
# > .libPath()  // that tell  you the  location  Where  the package are will be installed  
#ARG  HOSTED_RLIB_LOCATION="/usr/lib"
 
ADD  .  ./mTDT  
WORKDIR /mTDT 

#TRYING TO FIX R PACKAGE DEPENDACIES  DURING DOCKER BUILD 
RUN  chmod +xs RpkgAutorun.py  

#+ Generate file named  dependancies.R  that contains  missing libraries  
RUN  ./RpkgAutorun.py  --build-missing  

#+ Start Installing missing library  during build  

#RUN  ./RpkgAutorun.py  --install 

RUN echo "bin/" >> .gitignore 

###  EXTRACT  PLINK EXEC  TO CURRENT BIN FOLDER  
RUN mkdir  bin
RUN wget $plink_bin -P bin/  
RUN cd bin/ && unzip $plink_filename.zip && rm $plink_filename.zip

###  MAKE  SYMBOLIC LINK  TO USR/BIN 
RUN ln -s `pwd`/bin/plink /usr/bin/plink
RUN ln -s `pwd`/bin/prettify /usr/bin/prettify
RUN cd ../

WORKDIR  /mTDT/apps/

RUN npm install && npm install -g  pm2
RUN npm audit  fix --force   

#HINT : DEFAULT PORT USED IS 4000  BY  MODIFYING  THE ENV $PORT  
#       YOU NEED  TO SPECIFY  THE  '-e' ON DOCKER COMMAND LAUNCHER 
#       docker  run -d  -e PORT=<portvalue>  -p<hostPort>:<portvalue>  jukoo/m-tdt 
ENV PORT=4000 

EXPOSE $PORT 

CMD  ["pm2-runtime" , "mtdt_server.js"] 
