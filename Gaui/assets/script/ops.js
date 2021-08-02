//!  author  :  Umar aka  jukoo   < github.com/Jukoo  ||  j_umar@outlook.fr > 
//!  LICENCE :  not yet  
//!  ops.js  module  
//!  -------------------------------------------------------------------------
//!  This  web application is shared  between  2 client  
//!  Desktop  client and  web service client  
//!  so  the code source bellow  make an adaptation of each  
//!  this is  a one source for 2 client 
//!  -------------------------------------------------------------------------
const  { random, floor }       = Math    ,  
       { log  , error , warn } = console , 
       _                       = document   

let  ipcio  =  null  
try  {ipcio = require("electron")}catch (err) {}   
let  ipcRenderer                =  ipcio?.ipcRenderer ?? void function __(){ warn("using web services")}()   
const activate_extra_elements   =  !ipcRenderer  
ipcRenderer                     =  ipcRenderer || io()  
/* *
 * make common  usage  for socket   and  ipcRenderer  from electron  using  send_   
 * instead of respectivly  emit and send   native method  
 * */  
ipcRenderer["send_"]  =   (  event_name ,  g_object )  =>  {  
    if  (!activate_extra_elements ) ipcRenderer.send ( event_name  ,  g_object )
    ipcRenderer.emit ( event_name  , g_object )  
}   
function AssertionError ( message ) {   this.message =  message  }  
AssertionError.prototype =  Error.prototype 

Object.prototype["range"]  =  (v_ , s_=null)  =>   { 

    let [ t , i  ,  tmp ]  = [[] , 0 , null] 
    if  (s_  && s_ > v_)  
    {
        [ tmp  , v_  ]  =  [v_ , s_ ]  
        i               = tmp 
    }
    if  (s_ && s_ < v_) throw new AssertionError("the first args must be lower than the second args" ) 
    if  (v_ < 1  ||  v_ == undefined) return null  
    if  (v_ == 1 )  return  [v_] 
    
    while ( i < v_ )  
    { 
        t.push(i++) 
        
    }  
    return [...t]   

} 

const notify                      =  ( title , {...props } ) =>  new  Notification ( title , { ...props})  
const check_network_connectivity  =  ()                      =>  window.navigator.onLine 
const rand                        =  ( min , max=0 )         =>  max? random() * (max-min) + min : floor(random() * floor(min))  // however when one arg was set it's defined as max
const display_speed               =  hertz_frequency         =>  (1000/hertz_frequency) * 1 
const client_nav_fingerprint = ( { userAgent } )  =>  userAgent
const fetch_right_data       = ( release_extra_element   , event  , data  ) =>  release_extra_element  ? event : data 
//!  DOM  Html  mapping  
const  [
    ped , map , 
    phen, sm  ,
    mm  , yes , 
    no  , phenotype ,
    nbsim , nbcores ,
    markerset,term  , 
    run_summary,run_analysis, 
    sync , files_uploaders/*element node  |  undefined */ , files_browser/* element node | undefined*/ ,
    form_upload  
  ]=[
        _.querySelector("#ped"),   
        _.querySelector("#map"), 
        _.querySelector("#phen") , 
        _.querySelector("#single_marker") , 
        _.querySelector("#multi_marker") ,  
        _.querySelector("#yes"), 
        _.querySelector("#no"), 
        _.querySelector("#phenotype") , 
        _.querySelector("#nbsim") , 
        _.querySelector("#nbcores"),
        _.querySelector("#marker_set"), 
        _.querySelector("#term") , 
        _.querySelector("#run_summary"), 
        _.querySelector("#run_analysis"), 
        _.querySelector("#sync")  ,  
        activate_extra_elements  ?  _.querySelector("#files_uploader")      : (void function ()  { return  }() )  , 
        activate_extra_elements  ?  _.querySelector("input[type='file']")   : (void function ()  { return  }() )  , 
        activate_extra_elements  ?  _.querySelector("#form_upload")   : (void function ()  { return  }() )  
    ] ,
    [  
     i_lock  , i_unlock,
     blur_area, status, 
     microchip  , bar_progress 
  ] = [ 
    _.querySelector("#lock_default"), 
    _.querySelector("#unlocked_default"), 
    _.querySelector(".default-blur-content"),
    _.querySelector("#status"), 
    _.querySelector("#microchip"), 
    _.querySelector("#bar")  
]
__xtra_elements_ :   
modal_term   =  _.querySelector("#myModal") 
clone_term   =  term.cloneNode(true)  
modal_term.appendChild(clone_term)  
files_uploaders.disabled= true 
files_browser.value= "" 


const uploader  =   form_ =>  { 

    if (!form_.ELEMENT_NODE ==  Element.ELEMENT_NODE) 
    {
        error(`${ form_} is not an node element `)
        return  
    }
    const  payload = {  
        method:"POST" , 
        body  : new FormData(form_ ) 
    }
    window.fetch ("/" ,  { ...payload }  ) 
    
}
 
