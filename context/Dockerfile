# Rcovery for m-TDT 
# ----------------------------------------------------------------------
# * Most  of  the programme running behind m-TDT  is base 
# on R lang . therefor that requires many dependancies to run 
# correctly .  This Dockerfile <Rcovery> it's a build of  all 
# requiered dependancies ... 
# The application of m-TDT is based on nodejs  
# that's why  this image  use  it as default. 
# Perhaps  only the script that's install  the dependancies is available. 
# -----------------------------------------------------------------------
# copyright(c) 2022, Umar <jUmarB@protonmail.com> 


ARG  TAG_VERSION=3.15
ARG  NODE_DIST=18-alpine${TAG_VERSION}    

FROM node:${NODE_DIST}  

MAINTAINER  Umar  <jUmarB@protonmail.com> 

RUN apk  upgrade   

RUN apk add --no-cache R R-dev &&\
    apk add --no-cache util-linux &&\
    apk add --no-cache python3 

COPY  Rallib.txt /    
COPY  RpkgAutorun.py  /usr/local/bin 
RUN   RpkgAutorun.py  --build-missing   
RUN   RpkgAutorun.py  --install  


CMD [ "ash" ]  
