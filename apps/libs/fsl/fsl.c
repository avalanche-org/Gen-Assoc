#include <node_api.h> 

/**
 * NOTE: GNU/Linux  Compatible only
 */ 

#ifndef  __linux__ 
#error "Reserved Only for GNU/Linux OS x86 (glibc)"
#endif 

#include <stdlib.h> 
#include <string.h> 
#include <unistd.h> 
#include <fcntl.h> 
#include <dirent.h>  
#include <sys/types.h> 
#include <assert.h> 
#include <stdio.h> 
#include <sys/cdefs.h> 

#include <errno.h>

#ifdef __ptr_t 
#define _nullable (__ptr_t) 0  
#else 
#define _nullable  (void *) 0  
#endif 

#define __dptr_t  DIR*  
#define CWD  "." 

#define  MAX_DIRENT_CONTENT 0xff 

static __u_char dirent_content_list[MAX_DIRENT_CONTENT] = {0} ; 
/** 
 *
 */ 
static void * 
fsl_show_dirent_content(const char * dirname) 
{ 
  int i =0 ;  
  assert(dirname != _nullable) ; 
  __dptr_t dirent_status =  opendir(dirname)  ; 

  if (!dirent_status) return _nullable  ;  

  struct  dirent *  dirent_explorer  = _nullable ; 

  char content_name[MAX_DIRENT_CONTENT]={0} ; 
  while ( (dirent_explorer = readdir(dirent_status)) != _nullable ) 
  { 
  
    sprintf(content_name ,"%s\n" ,dirent_explorer->d_name) ; 
    strcat(dirent_content_list , content_name) ; 
    explicit_bzero(content_name ,  MAX_DIRENT_CONTENT) ; 

  } 

  return dirent_content_list ; 
}

static  napi_value  
list_target_directory(napi_env env , napi_callback_info  info)
{
  napi_status  rc  ; 
  napi_value   internal  ; 

  short  argc= 1 ; 
  napi_value argv ; 
  
  rc = napi_get_cb_info(env, info  ,&argc , argv ,  _nullable ,_nullable) ;
  
  assert(rc  == napi_ok); 
  if (argc == 0  ) {
    napi_throw_type_error(env  , _nullable , "requier 1 argument position") ;  
    return _nullable ; 
  }

  char cbuff[MAX_DIRENT_CONTENT] ={0}; 
  size_t size ; 

  rc = napi_get_value_string_utf8(env , argv , cbuff, MAX_DIRENT_CONTENT, &size) ; 
  
  if(rc != napi_ok ) {
    printf("-argument :: %s :: size : %li\n" ,  cbuff , size);
    napi_throw_type_error(env ,  _nullable , "napi_get_value_string_utf8: error") ; 
    return _nullable ;
  }

  printf("-argument :: %s :: size : %li\n" ,  cbuff , size);

  __u_char  *content = (__u_char *) fsl_show_dirent_content(CWD) ; 

  rc = napi_create_string_utf8(env , content  , strlen(content) ,  &internal) ; 

  if (rc != napi_ok)return _nullable ; 

  return internal ; 
} 

/** 
 *
 */ 
static  napi_value 
fsl_init(napi_env env  , napi_value exports) 
{
  napi_value  internal ; 
  napi_status rc ; 
  
  rc = napi_create_function(env , _nullable , 0 ,  list_target_directory , _nullable, &internal) ; 
  if (rc  != napi_ok) return _nullable ; 
   
  rc = napi_set_named_property(env ,exports ,   "list_target_directory" ,  internal) ;  
  if (rc  != napi_ok) return _nullable ; 
 
  return exports ; 
}

NAPI_MODULE(NODE_GYP_MODULE_NAME ,  fsl_init) 
