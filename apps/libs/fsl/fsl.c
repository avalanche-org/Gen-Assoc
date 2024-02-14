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

#define  MAX_DIRENT_CONTENT 0xff 

static int err_ref = 0 ; 
static __u_char dirent_content_list[MAX_DIRENT_CONTENT] = {0} ; 

/** 
 * @fn fsl_show_dirent_content(const char * ) 
 * @brief  list  directory content 
 * @param  const char *  -  path 
 * @return void * - [nullable mean fail] 
 */ 
static void * 
fsl_show_dirent_content(const char * dirname) 
{ 
  int i =0 ;  
  assert(dirname != _nullable) ; 
  __dptr_t dirent_status =  opendir(dirname)  ; 

  if (!dirent_status){
    err_ref=errno ;  
    return _nullable; 
  }  

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

/**
 * @fn list_target_directory(napi_env , napi_callback_info) 
 * @brief method expose to node 
 * @param   napi_env 
 * @param   napi_callback_info
 * @return  napi_value
 */ 
static  napi_value  
list_target_directory(napi_env env , napi_callback_info  info)
{
  napi_status  rc  ; 
  napi_value   internal  ; 

  size_t   argc= 1; 
  napi_value args[1] ; 
  
  rc = napi_get_cb_info(env, info  ,&argc , args ,  _nullable ,_nullable) ;
  assert(rc  == napi_ok); 
  
  if (argc == 0  ) {
    napi_throw_type_error(env  , _nullable , "requier 1 argument position") ;  
    return _nullable ; 
  }

  napi_valuetype  expected_type ; 
  rc = napi_typeof(env , args[0], &expected_type) ; 

  char cbuff[MAX_DIRENT_CONTENT] ={0}; 
  size_t size ;

  rc = napi_get_value_string_utf8(env , args[0] , cbuff, MAX_DIRENT_CONTENT, &size) ; 
  
  if(rc != napi_ok ) {
    napi_throw_type_error(env ,  _nullable,"Fail to get string value") ; 
    return _nullable ;
  }

  __u_char  *content = (__u_char *) fsl_show_dirent_content(cbuff) ;
  
  if (!content  && err_ref !=0 ){
    napi_throw_type_error(env, _nullable ,strerror(err_ref)) ; 
    return _nullable ; 
  }

  rc = napi_create_string_utf8(env , content  , strlen(content) ,  &internal) ; 

  if (rc != napi_ok)return _nullable ; 

  explicit_bzero(content ,  MAX_DIRENT_CONTENT) ; 
  return internal ; 
} 

/** 
 * @fn  fsl_init(napi_env , napi_value) 
 * @brief  initialize and set some  properties for exposed functions 
 * @param  napi_env 
 * @param  napi_value 
 * @return napi_value 
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
