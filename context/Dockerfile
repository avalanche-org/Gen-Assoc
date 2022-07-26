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

ARG   REPOSITORY=node 

FROM  $REPOSITORY:$DIST

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
RUN apt install bsdmainutils  --assume-yes

COPY RpkgAutorun  /usr/bin/  

COPY Rallib.txt   / 
#+ Generate file named  dependancies.R  that contains  missing libraries  
RUN RpkgAutorun  --build-missing  

###  EXTRACT  PLINK EXEC  TO CURRENT BIN FOLDER  
RUN wget $plink_bin  
RUN unzip $plink_filename.zip && rm $plink_filename.zip

###  MAKE  SYMBOLIC LINK  TO USR/BIN 
RUN mv   plink  /usr/bin/plink 
RUN mv   prettify /usr/bin/prettify

WORKDIR  /  

CMD [ "bash" ]
