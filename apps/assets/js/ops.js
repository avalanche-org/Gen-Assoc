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
    form_upload ,  job_title ,  job_init  ,  disconnect , p_menu, interm , giyes , gino , download , abort , download_assets, zoom_in, zoom_out ,
    carousels, carousel_prev , carousel_next 
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
        activate_extra_elements  ?  _.querySelector("#download")            : (void function ()  { return  }() )  ,  
        activate_extra_elements  ?  _.querySelector("#abort_execution")     : (void function ()  { return  }() )  ,  
        activate_extra_elements  ?  _.querySelector("#download_assets")     : (void function ()  { return  }() )  ,  
        activate_extra_elements  ?  _.querySelector("#zoom_out")            : (void function ()  { return  }() )  ,  
        activate_extra_elements  ?  _.querySelector("#zoom_in")             : (void function ()  { return  }() )  , 
        activate_extra_elements  ?  _.querySelectorAll(".carousel-item")    : (void function ()  { return  }() )  , 
        activate_extra_elements  ?  _.querySelector(".carousel-control-prev"):(void function ()  { return  }() )  , 
        activate_extra_elements  ?  _.querySelector(".carousel-control-next"):(void function ()  { return  }() )   
    ] ,
    [  
     i_lock  , i_unlock,
     //blur_area, 
     status, 
     microchip  , bar_progress 
  ] = [ 
    _.querySelector("#lock_default"), 
    _.querySelector("#unlocked_default"), 
    //_.querySelector(".default-blur-content"),
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

export  const  shortcup_maping  =  { 

    "ctrl_c" : (kb_combinaison)  =>   {  
        const  ctrl_c_charCodes =  [17,67]  
        const  ctrl_c_hold      =  [67,67]  
        const  valdation_sc     = [ 
            JSON.stringify(kb_combinaison) ==  JSON.stringify(ctrl_c_charCodes)  , 
            JSON.stringify(kb_combinaison) ==  JSON.stringify(ctrl_c_hold) 
        ]
        if ( valdation_sc[0] || valdation_sc[1])  
        {
            kb_combinaison =  [] 
            return  true  
        }
        kb_combinaison= []  
    }  

} 
export  const  window_keyShortcut =( shortcut_behavior_action ,  callback_handler)  =>  {  
    let  kb_combinaison  =[] 
    document.addEventListener("keyup" , evt => {  
        kb_combinaison.push(evt.which) 
        if  (evt.which == 27  ) kb_combinaison= [] 
        
        if ( kb_combinaison.length  == 2  )  
        {
            callback_handler(shortcut_behavior_action(kb_combinaison))  
            kb_combinaison=[] 
        }
            
        
    }) 
}

/**
 * parse  weird   unicode character  that's came from 
 * exec binary  (plink)   
 * @param   { string }  data -   buffer data  
 * @retrun  { string }  parsed string buffer  
 */
export  const parse_unknow_ascii_unicode   = data =>  { 
    const unknow_unicode_pattern_regex  =/\d+%*.+%|\P{L}+/gm
    return  data.replace(unknow_unicode_pattern_regex , '') 

}

/*  carousel handler */ 


export const  carousel_navigation  =  webui_stdterm =>  { 
    

    const  carousels_block  = [ ...carousels]  
    const  carousels_block_size =  carousels_block.length -1   
    
    const  navigation  = [  carousel_prev , carousel_next ]  
    
    navigation.forEach ((carousel_navbtn , index) =>  { 

        carousel_navbtn.addEventListener("click" , evt =>  {

            let  active_carousel =  carousels_block.filter(  carousel =>  carousel.classList.contains("active")).at(0)   
            let  active_carousel_position  = carousels_block.indexOf(active_carousel) 
            let  next_carousel    =  0   
            let  preview_carousel =  0   
            
            next_carousel    = index == 1 ? active_carousel_position    +1  : null  
            preview_carousel = index == 0 ? active_carousel_position    -1  : null  

            if (next_carousel && next_carousel > carousels_block_size  ) 
            {
                //NOTE:  get back to first slide 
                active_carousel.classList.remove("active")
                next_carousel   = 0  
                active_carousel = carousels_block.at(next_carousel) 

            } 
             
            if  ( preview_carousel && preview_carousel < (~carousels_block_size+1) )    
            {
                //!NOTE : get back to  the last slide  
                active_carousel.classLit.remove("active")   
                preview_carousel  =  carousels_block_size 
                active_carousel = carousels_block.at(preview_carousel)   
            }
        
            if (active_carousel.classList.contains("active"))
                active_carousel.classList.remove("active") 
           
            let  active_index  =  next_carousel   ?  next_carousel  :  preview_carousel  
             
            let  activated_carousel  =  carousels_block.at(active_index)   
            activated_carousel.classList.add("active") 
            
            const cctitle  = activated_carousel.childNodes[1].textContent 
            webui_stdterm(cctitle , false , false ,false ) 
             
        
        })
    })  
   
   

}  
