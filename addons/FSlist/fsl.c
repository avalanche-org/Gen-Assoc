#ifndef  __gnu_linux__  
#error "Reserved  For GNU/Linux OS" 
#else  
#include <stdlib.h> 
#include <unistd.h>
#include <stdio.h> 
#include <string.h> 
#include <dirent.h>  
#include <err.h> 
#include <errno.h> 
#endif 

#include <node_api.h> 
#define  nullable  (void *) napi_ok  

#define  __check(__rfcc) \
  if (__rfcc !=  napi_ok) return nullable  

typedef struct __fsl_api_version_t  fsl_vapi_t ; 
struct __fsl_api_version_t { 
  int major  ; 
  int minor ; 
  int patch  ; 
} ;

static  char * fsl_dirent_list (void)  
{

  DIR * open_directory_status = opendir(".");  
  if(!open_directory_status) 
    errx(errno ,  "%s" , strerror(errno)) ; 
  
  struct dirent * d =  (void *)  0; 
  
  while (  (d = readdir(open_directory_status)) != (void *) 0 ) 
  {
    printf("-> %s \n", d->d_name) ; 
  }

  return  (void *) 0  ; 
  
}


static   napi_value  dscan (napi_env  env  ,  napi_callback_info  info) 
{
  napi_value internal ; 
  napi_status  rc   ;


  fsl_dirent_list(); 

  char *mesg_test = "napi_4fsl\nversion 1\n";
   
  //rc = napi_create_string_utf8(env ,mesg_test, strlen(mesg_test) , &internal) ;
  rc = napi_create_object(env  ,&internal) ;

  __check(rc); 

  return  internal  ; 
}


static napi_value  init_module(napi_env env , napi_value exports) 
{
   //napi_value  internal ;
   napi_status rc; 
  
   napi_property_descriptor  test_scope =   {
     "dscan" ,  
     0 , 
     dscan,
     0,0,0,
     napi_default , 
     0
   };

   rc = napi_define_properties(env  , exports ,  1, &test_scope) ; 

   __check(rc); 
   return  exports ;  
}
NAPI_MODULE(NODE_GYP_MODULE_NAME , init_module) ;  
