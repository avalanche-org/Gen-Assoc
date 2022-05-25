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


ARG  BASE_NODE_VERSION=17 
ARG  CODENAME=bullseye
ARG  DIST=${BASE_NODE_VERSION}-${CODENAME}  


From node:${DIST}  

MAINTAINER Umar <jUmarB@protonmail.com> <github/Jukoo> 


RUN apt update --assume-yes && \
    apt install r-base r-base-dev bsdmainutils git --assume-yes 

COPY Rallib.txt    / 
COPY RpkgAutorun.py /  

RUN  chmod +xs  RpkgAutorun.py  
RUN  ./RpkgAutorun.py --build-missing

ENTRYPOINT ["./RpkgAutorun.py" , "--install"]   
