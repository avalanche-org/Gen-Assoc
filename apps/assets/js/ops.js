//!  author  :  Umar aka  jukoo   < github.com/Jukoo  ||  j_umar@outlook.fr > 
//!  LICENCE :  not yet  
//!  ops.js  module  
//!  -------------------------------------------------------------------------
//!  This  web application is shared  between  2 client  
//!  Desktop  client and  web service client  
//!  so  the code source bellow  make an adaptation of each  
//!  this is  a one source for 2 client 
//!  -------------------------------------------------------------------------
export const  { random, floor }       = Math    ,  
       { log  , error , warn } = console , 
       _                       = document   
/*
let  ipcio  =  null  
try  {
    ipcio = require("electron")}
catch (err) {}   

export let  ipcRenderer                =  ipcio?.ipcRenderer ?? void function __(){ warn("using web services")}()  

export const activate_extra_elements   =  !ipcRenderer  
ipcRenderer                     =  ipcRenderer || io()  
*/ 

/* *
 * make common  usage  for socket   and  ipcRenderer  from electron  using  send_   
 * instead of respectivly  emit and send   native method  
 * */

export let ipcRenderer =  io()
export const activate_extra_elements  = !!ipcRenderer 

export const  __setup_ipcRenderer =  ipcRenderer =>   { 
    if  (!ipcRenderer?.["send_"] ) 
        ipcRenderer["send_"]  =   (  event_name ,  g_object )  =>  {  
            if  (!activate_extra_elements ) ipcRenderer.send ( event_name  ,  g_object ) 
            ipcRenderer.emit ( event_name  , g_object )
        } 
}


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

export const notify                      =  ( title , {...props } ) =>  new  Notification ( title , { ...props})  
export const check_network_connectivity  =  ()                      =>  window.navigator.onLine 
export const rand                        =  ( min , max=0 )         =>  max? random() * (max-min) + min : floor(random() * floor(min))  // however when one arg was set it's defined as max
export const display_speed               =  hertz_frequency         =>  (1000/hertz_frequency) * 1 
export const client_nav_fingerprint = ( { userAgent } )  =>  userAgent
export const fetch_right_data       = ( release_extra_element   , event  , data  ) =>  release_extra_element  ? event : data 

export const sleep  = ( duration  , callback_statement = false )   =>   {
    setTimeout(  () => { callback_statement() ?? undefined  }   , duration )
}
//!  DOM  Html  mapping  
export const  [
    ped , map , 
    phen, sm  ,
    mm  , yes , 
    no  , phenotype ,
    nbsim , nbcores ,
    markerset,term  , 
    run_summary,run_analysis, 
    sync , files_uploaders/*element node  |  undefined */ , files_browser/* element node | undefined*/ ,
    form_upload ,  job_title ,  job_init  ,  disconnect , p_menu, interm , giyes , gino , download  
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
        activate_extra_elements  ?  _.querySelector("#form_upload")         : (void function ()  { return  }() )  ,  
        activate_extra_elements  ?  _.querySelector("#job_title")           : (void function ()  { return  }() )  ,  
        activate_extra_elements  ?  _.querySelector("#start_job")           : (void function ()  { return  }() )  ,     
        activate_extra_elements  ?  _.querySelector("#disconnect")          : (void function ()  { return  }() )  , 
        activate_extra_elements  ?  _.querySelectorAll(".pointing > a")     : (void function ()  { return  }() )  ,  
        activate_extra_elements  ?  _.querySelector("#detach_term")         : (void function ()  { return  }() )  ,
        activate_extra_elements  ?  _.querySelector("#gi-yes")              : (void function ()  { return  }() )  , 
        activate_extra_elements  ?  _.querySelector("#gi-no")               : (void function ()  { return  }() )  ,  
        activate_extra_elements  ?  _.querySelector("#download")            : (void function ()  { return  }() ) 

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

export  const   __lock_web_ui_file_operation  =  () => { 
    files_uploaders.disabled= true 
    files_browser.value= "" 
}

export const uploader  =   async   form_ =>  { 

    if (!form_.ELEMENT_NODE ==  Element.ELEMENT_NODE) 
    {
        error(`${ form_} is not an node element `)
        return  
    }
    const  payload = {  
        method:"POST" , 
        body  : new FormData(form_ ) 
    }
    const  state  = await window.fetch ("/" ,  { ...payload }  )

    return  state 
}

export const mtdterm_rowline_handlers   =  which_keycode   =>   { 
    const  total_lines =  term.value.split("\n") 
    let value  =  ( void function ()  { return} () )   //  is undefined  
    switch  ( which_keycode ) 
    {
        case   0x00D : 
            const  last_line =  total_lines[total_lines.length - 1 ] 

            value   = last_line.substr(1, last_line.length)  
            value   = value.trim()
            break ;
        //! TODO :  you can implement other  keycode  operation bellow 
    }

    return value 
}  
