//! author  : umar aka juko    < github/jukoo>  
//! this script make a bridge between  main  process and renderer process 
//! sending event through backend side   

import  {
    _
    ,ipcRenderer
    ,__setup_ipcRenderer 
    ,notify 
    ,activate_extra_elements
    ,check_network_connectivity
    ,display_speed
    ,client_nav_fingerprint 
    ,fetch_right_data 
    ,sleep
    ,uploader
    ,mtdterm_rowline_handlers
    ,ped, map , phen,sm,mm ,yes,no,phenotype,nbsim,nbcores,markerset, term 
    ,run_summary, run_analysis ,sync ,files_uploaders, files_browser ,disconnect
    ,form_upload,job_title ,p_menu , interm , giyes,gino,download,job_init,abort
    ,download_assets ,zoom_out , zoom_in , carousels , carousel_next , carousel_prev , gi_modal_no,gi_modal_yes
    ,cancel_analysis , proceed_analysis , validate_ms, processing 
    //blur_area
    //,i_lock ,i_unlock , status, microchip , bar_progress
    ,__lock_web_ui_file_operation 
    ,log , error,warn
    ,random , floor  

    ,window_keyShortcut,shortcup_maping,parse_unknow_ascii_unicode ,  carousel_navigation
    ,cnav_cache  

}  from  "./ops.js"  




__setup_ipcRenderer(ipcRenderer)  
__lock_web_ui_file_operation()  

ipcRenderer.send_("clifp" ,   { user_agent : client_nav_fingerprint(navigator) , ls_session : localStorage["task"]?? null})

cnav_cache()  ;  



if (!localStorage["task"] )   
{
    files_browser.disabled  = true
    files_uploader.disabled =  true
    job_init.addEventListener("click" , evt  => {
        evt.preventDefault()  
        if (!job_title.value) files_browser.disabled = true  
        if (job_title.value)   
        { 
            ipcRenderer.send_("create::job"  ,  job_title.value )  
            carousel_next.click()
        }
    })
}  
if  ( localStorage["task"] )
{   
    carousel_next.click() 
    carousel_next.click() 

    job_init.value="pending"
    job_title.value= localStorage["task"].split("/").slice(-1) 
    job_title.disabled = true 
    job_init.disabled =  true 
    files_browser.disabled  = false 
    files_uploader.disabled   = false 
} else
    job_title.value = ""  

let jauge   =  0 
/*
const //progress_step =(state  ,  status_message , duration /*millisec) => {
    if  ( state >100 ) return 
    if  (jauge !=  0  && jauge >=  state)  return  
    status.innerHTML =`<i class="fa fa-spinner fa-pulse fa-1x fa-fw"></i>${status_message}`
          bar_value     =  bar_progress.textContent   ,
          bar_state     =  parseInt(bar_value.slice(0 , -1 ))
    
    jauge = bar_state 
    const  move_progress_bar =  setInterval( animate   , duration)
    function animate () {
        if ( jauge==  state) {  
            clearInterval(move_progress_bar) 
            status.innerHTML =""

        }
        bar_progress.style.width=`${jauge}%` 
        bar_progress.textContent=`${jauge}%`
        jauge++ 
    }  

}

//progress_step(10 ,"initialization..." , 200 )
*/

let display_= (void function ( ) { return  } ())   //  undefine 

let terminal ,  writeSpeed 

( ()=> {
    run_analysis.disabled =  false 
    term.innerText        =  "▮ "
    term.setEditable      =  false
    term.disabled         =  true 
    phenotype.disabled    =  false 
    nbsim.disabled        =  false  
    nbcores.disabled      =  false
    mm.disabled           =  false 
    markerset.disabled    =  true 
    validate_ms.disabled  =  true 
    markerset.style.backgroundColor="grey"
    markerset.style.color="whitesmoke"
    ipcRenderer.send("init",1)
    writeSpeed            =  0 
    display_              = display_speed(2)
})() 


let   show_nt = 0  ;  
setInterval( () => {
    if (check_network_connectivity()) 
    {   
        show_nt++ ;  
        if  ( show_nt  == 1  )   
        {
            notify("-><- " ,  {body : "Online"}) 
            if (_.querySelector("#network"))
                _.querySelector("#network").style.color="green"
        }
        
        
    } else {  
        show_nt =0 
        _.querySelector("#network").style.color="firebrick"  
    } 
} , 10000 )

let  numdigit =  []

const capture_ctrl  =  ( self ) => {
     if (!isNaN(self.target.value)) 
    { 
        numdigit.push(self.target.value) 
    }
    self.target.value  =  numdigit[numdigit.length -1 ]  ?? ""
}

nbsim.addEventListener("keyup"  ,   evt =>   {
    capture_ctrl(evt)  
    nbcores.disabled = !isNaN(evt.target.value)&& parseInt(evt.target.value)  >  1  ? false  : true 
})

let  is_it_correct   =  null
markerset.addEventListener("keyup" ,  evt =>  {
    const require_patern  =  /^(\d{1,},)+\d+$/g
    const just_on_digit   = /^\d{1,}$/g
    if (require_patern.test(evt.target.value) || just_on_digit.test(evt.target.value)) {
        markerset.style.backgroundColor = "green"
        markerset.style.color = "whitesmoke"
        is_it_correct         = true 
        validate_ms.disabled  = false 
    }else {
        markerset.style.backgroundColor ="firebrick"
        markerset.style.color = "black"
        is_it_correct         = false 
        validate_ms.disabled  = true 
    }

})
let  global_info =  ""    

_.querySelector("#clear").addEventListener("click", evt => {
    term.value= "▮" ;  term.style.color="whitesmoke"
    ipcRenderer.send("clear::term" ,  null )   
})
_.querySelector("#infosys").addEventListener("click" , evt =>  {  
    term.value = ""  
    ipcRenderer.send_("info" ,  true )  
    term_write(global_info) 
   
    if  (! activate_extra_elements ) ipcRenderer.send("system::info" , global_info )  
})


const  follow_scrollbar  =  () => {term.scrollTop =term.scrollHeight}
const  term_write  =  ( incomming_data  , warning = false ,  wspeed = false , __brutal_splash =  true )  => {
    let  c  =  0 ;     
    if (__brutal_splash )  
    {
        term.value +=`${incomming_data}`
        follow_scrollbar() 
        return 
    }
    (function write_simulation () {
        if  (incomming_data ==  undefined)  
        {
            term.value = ""
            return   
        }
        follow_scrollbar()  
        if ( c <  incomming_data.length) { 
            let termbuffer = `${incomming_data.charAt(c)}`  
            if ( c != incomming_data.length -1) 
                termbuffer =`${termbuffer}` 
            term.value +=termbuffer
            if  ( warning )   term.style.color ="orange" 
            else   term.style.color = "whitesmoke" 
            c++ 
            setTimeout(write_simulation , wspeed ||writeSpeed)  
        }else  
            clearTimeout(write_simulation) 
    })()
}
/*
const toggle_blink =  (  element ,  ...colorshemes/* only 2 colors  are allowed )  => {
    if  (colorshemes.length > 2  || colorshemes <=1  ) 
        AssertionError("requires two colornames")  

    if ( element.style.color== colorshemes[0] ) 
        element.style.color =  colorshemes[1]
    else  
        element.style.color = colorshemes[0] 
}
const use_cpus_resources = signal_trap  => {  
    let  blink =  null 
    if  (signal_trap)   {
         blink = setInterval( () => {  
            toggle_blink(microchip ,  "black"  , "limegreen")
        } ,100) //display_)
    }else  
        clearInterval(blink)  
}
*/
const stop_blink_on_faillure   = ( target ,   state  ) => {
    if ( !target )  
        log("") 
        //use_cpus_resources(state) 
}

let  logfile  =  null

ipcRenderer.on("initialization" ,  (evt , data)  =>{
     
    data  = fetch_right_data(activate_extra_elements , evt , data ) 
    let    { version ,logpath_location,  available_cpus_core } =  data.initiate ||   data  
    let  {os_detail_info}  =  data?.initiate || data 

    if (!os_detail_info) os_detail_info = data 
    if (!available_cpus_core)  available_cpus_core =  os_detail_info?.cpus
    /*
    notify("mTdt ", { body : ` mTdt  version ${version}`})
    if   ( data.init_proc == 1 &&  localStorage["iproc"] != 1||  os_detail_info)
    {   
        for ( let si  in  os_detail_info )
        {
            if ( si !== "range") 
            { 
                term.value += `${si} : ${os_detail_info[si]}\n`  
                global_info+= `${si} : ${os_detail_info[si]}\n`  
            } 
        } 
         localStorage["iproc"]= data.init_pro 
    } 
    if  ( localStorage['iproc'] == 1  )  {
        global_info = "" 
        for ( let si  in  os_detail_info )
        {
            if ( si !== "range") 
                global_info+= `${si} : ${os_detail_info[si]}\n`  
        } 

    }*/
    if ( available_cpus_core )
    {
        logfile  = logpath_location
        for  ( let i of   range(available_cpus_core-1) ) 
        { 
            const ncores_opt =  _.createElement("option") 
            ncores_opt.text=i+1  
            nbcores.add(ncores_opt) 
        }
    }
})

ipcRenderer.on("clean::localStorage" ,  (evt , data ) => {
    localStorage.clear()  
})


const  get_ext  = args   =>  {
    let  _d  =  args.split(".")  
    return  _d[_d.length -1 ]  
}
const get_prefix_filename =  ( file , separator = ".")  => {
    let file_prefix       =  file.split(separator)  
    return  file_prefix.slice(0 ,-1)  
}

const  is_satisfied  =  needs   => { 
    for  ( let need of needs )  
         return !(( need == null ||  need  == "" ||  need ==  undefined ))   

    return true 
}
const  optsfeed  =  gdata   => {
    gdata.forEach(data => {
        let ext = get_ext(data)  
        switch  (ext) { 
            case  "ped" : 
                const  ped_opts =  _.createElement("option") 
                ped_opts.text   = data  
                ped_opts.value  = data  
                ped_opts.title  = data  
                ped.add(ped_opts)  
                break ; 
            case  "map" : 
                const  map_opts =  _.createElement("option") 
                map_opts.text   = data
                map_opts.value  = data
                map_opts.title  = data
                map.add(map_opts)  
                break ; 
            case  "phen" : 
                const  phen_opts =  _.createElement("option") 
                phen_opts.text   = data  
                phen_opts.value  = data 
                phen_opts.title  = data 
                phen.add(phen_opts)   
                break;  
        }
     })

}
let 
[paths_collections ,   files_collections]   = [  localStorage["task"]  ||  []  , [] ] 

// on file  chooser  dialog  =>  +5 %  

ipcRenderer.emit("load::fstatic" , null )   
ipcRenderer.on("Browse::single"   , (evt ,  global_object ) =>   { 
    
    global_object = fetch_right_data ( activate_extra_elements   , evt, global_object )   
    
    const  { main_root  , files} = global_object  
    log (main_root) 
    
    paths_collections =  main_root
    localStorage["task"] =  main_root  
    files_collections =  files
    optsfeed(files) 

   
    ////progress_step(15 , `loading  files ` ,  rand(400)) 
}) 
ipcRenderer.on("Browse::multiple" , (evt , mbrowse_data )  =>{
    const request_files =  Object.keys(mbrowse_data)  
    paths_collections   =  Object.values(mbrowse_data)   
    
    for ( let  htm_elmt  of  [ ped  , map , phen ]  )  htm_elmt.innerHTML= ""    
    optsfeed(request_files)
    //progress_step(15 , "loading files ..." , rand(400)) 
})
//ipcRenderer.on("trunc::baseroot" ,  virtual_namespace  =>   {  
    
  //  path_collections =  virtual_namespace  
    
//}) 
//! sync select action  between  ped and maps
const sync_select_action =  (s_elmt1 , s_elmt2) => {
    s_elmt1.addEventListener("change" , evt =>{ 
        const  file_name      = get_prefix_filename(evt.target.value)  
        let    map_elmts_opts =  [...s_elmt2.options]  
        map_elmts_opts        =  map_elmts_opts.map(opts =>  opts.value)  
        const  match          = map_elmts_opts.filter( element => {
            let f_prefix =  get_prefix_filename(element)  
            if (file_name[0]  == f_prefix[0] )  return  element  
        })
        if (match) {
            let data_index  = map_elmts_opts.indexOf(match[0]) 
            try  {  
                s_elmt2.options[data_index].selected= true  
            }catch ( no_sync_error )  { /*shuuuttt !!!!*/}
        } 
    })
} 
//!  this section  make a synchronisation  between ped map and  phen file  
sync.addEventListener("change" , evt =>  { 
    if  ( evt.target.checked )  
    {   
        notify("synced mode " , {body:"synced mode is activated"}) 
        sync_select_action(ped , map) /*<--*/;/*-->*/sync_select_action(map, ped)  
        sync_select_action(ped , phen)/*<--*/;/*-->*/sync_select_action(map,phen) 
    }   
})  
//!--end sync  

/*
mm.addEventListener("click" , evt => { 
    evt.preventDefault()  
    if (evt.target.checked) { 
        markerset.disabled = false 
        markerset.style.backgroundColor="whitesmoke"
        markerset.style.color="grey"
        markerset.focus()
        //nbsim.disabled     = false 
    }
})
sm.addEventListener("change" , evt => {
    if(evt.target.checked) { 
        markerset.disabled = true
        markerset.style.backgroundColor="grey"
        markerset.style.color="whitesmoke"
        //nbsim.disabled     = true 
    } 
})

*/


/*  Abort Execution Event send kill signal 
 *  through socker  
 **/  
abort.addEventListener("click"  , evt=>  { 
    ipcRenderer.send_("kill"  ,   null)
}) 
/**
 * bind Ctrl^C  key to   window  for easy aborting  execution 
 */
window_keyShortcut(shortcup_maping["ctrl_c"] , "" ,  action =>  {
    ipcRenderer.send_("kill" , null )  
})  

/* 
 * navigation control  using arrow 
 */ 

window_keyShortcut(shortcup_maping["lr_arrows"] , [ carousel_prev , carousel_next]  ,   _ => log(""))  
 
window_keyShortcut(shortcup_maping["jump_step"]  ,  "" ,   index  =>  {  

    //carousel_navigation(index) 
})  





let ped_  = null , 
    map_  = null ,
    phen_ = null   

let summary_already_run =  false , 
    analysis_on_going   =  false 

let  gobject = {}  
gobject["paths"]  = paths_collections  ||  null 
gobject["selected_files"]  =  localStorage["summary_dump"]  

run_summary.addEventListener("click" , evt => {
    evt.preventDefault()
    processing.classList.toggle("active") 
    let  annoucement  = "▮ Generating Summary Statistics ... please wait\n" 
    let  warning_alert = false  
    //plugonlog() 
    //setInterval(plugonlog , term_display_speed)    
    //status.innerHTML =`<i class="fa fa-spinner fa-pulse fa-1x fa-fw"></i> processing ...`
    //status.style.color = "blue"   
    //bar_progress.style.backgroundColor = "limegreen"   
    run_analysis.disabled = true 
    run_summary.disabled  = false   
    gobject ={ 
         paths  : paths_collections ??  null ,  
         selected_files: [ 
              ped.options[ped.selectedIndex]?.value  ??  null ,   
              map.options[map.selectedIndex]?.value  ?? null , 
              phen.options[phen.selectedIndex]?.value ?? null  
         ]
    }

    const  { paths , selected_files }  = gobject 
 
    const done   = is_satisfied (selected_files)  
    if  (!done)  {
        annoucement = "❗ No files selected "  
        warning_alert   = true  
        run_summary.disabled = false   
    }
    
    ipcRenderer.send_("annoucement" ,  annoucement) 
    term.value =  ""   //  clean output before
    if(warning_alert)  
    { 
        //status.innerHTML =`<i style='color:orange' class="fas fa-exclamation-triangle"></i> Warning ${annoucement}...`
        //bar_progress.style.backgroundColor="orange"
    }

    term_write(annoucement  , warning_alert )    
 
    if (done) {
        [ped_  , map_ , phen_ ]  =  selected_files 
        summary_already_run = true  
        localStorage["summary_dump"]  =  [ ... selected_files ] 
        ipcRenderer.send_("run::summary",  gobject ) 
    } 
})


const markersetting  = [  sm  , mm ]  
let   [_sm  , _mm ]  = [ false , false ] 
const msruntitle  =`/!\\ Validity Treshold  on Selected files ${gobject.selected_files}`
markersetting.forEach (  ( marker_runType , code_index  ) =>  {
    //! the code index  take  index array as code  like  -->  sm : 0  and mm  :1  
    marker_runType.addEventListener("click" ,  evt =>  { 
        evt.preventDefault()   
        markerset.disabled =  code_index^1  
        if  ( markerset.disabled)  
        {
            [_sm  , _mm ]  =[true ,  false] 
           
            term_write(msruntitle , true ) 
            const  data =   [ +_mm ,  gobject ]  
            // TODO : send event to run  validity threshold  
            ipcRenderer.send_("validitythreshold" ,   data)
            
            //carousel_next.click()  
            return  
        }
        [_sm,_mm]  = [false , true ]  
    })

}) 
ipcRenderer.on("vt::exitsuccess" , ec =>  carousel_next.click())   
//! MARKER SET VALIDATION  

validate_ms.addEventListener("click" , evt =>  { 
    evt.preventDefault() 
    const  data  = [  markerset.value  ,  gobject ] 
    term_write(msruntitle  , true  ) 
    ipcRenderer.send_("validitythreshold" , data) 
    //carousel_next.click()  
}) 



mm.addEventListener("change" , evt => {
    if (evt.target.checked) { 
        markerset.disabled = false 
        markerset.style.backgroundColor="whitesmoke"
        markerset.style.color="grey"
        markerset.value=""
        markerset.focus()
        //nbsim.disabled     = false 
    }
})
sm.addEventListener("change" , evt => {
    if(evt.target.checked) { 
        markerset.disabled = true
        markerset.style.backgroundColor="grey"
        markerset.style.color="whitesmoke"
        markerset.placeholder="Choose your markers .eg 1,3,24"
        //nbsim.disabled     = true 
    } 
}) 

let  enable_switch_between_theorical_or_emperical   = false  
ipcRenderer.on("load::phenotype" ,  incomming_data  =>  {
    processing.classList.toggle("active")  
    phenotype.innerHTML = ""  
    nbcores.disabled =  false 
    incomming_data =  incomming_data
    term_write (`total phenotype ${incomming_data}` )
    for  ( let phen_index  of range(incomming_data )) { 
        const phenotype_opts = _.createElement("option")  
        phenotype_opts.text      =  phen_index  
        phenotype_opts.value     =  phen_index
        phenotype.add(phenotype_opts)   
    } 
     
    enable_switch_between_theorical_or_emperical  = true 
})



ipcRenderer.on("term::logout" , data  => {
    // fetch_right_data ( activate_extra_elements ,  evt ,data ) 
    
    data  =  parse_unknow_ascii_unicode(data)  

    term.focus() 
    if  (data)    
    { 

        term_write(data) 
       // run_summary.disabled  = summary_already_run 
        
        follow_scrollbar()  
        run_analysis.disabled = !summary_already_run  
        phenotype.disabled    = !summary_already_run  
        nbsim.disabled        = !summary_already_run
        //i_lock.classList.remove("fa-lock") 
        //i_lock.classList.add("fa-unlock") 
        mm.disabled            =  false 
        //blur_area.style.filter = "blur(0px)"
    }
})
//! TODO :  [ optional]  style  output error  with red or orange color  ...
let tigger  = false
ipcRenderer.on("log::fail", (evt , data)  => {
    data  =  fetch_right_data  ( activate_extra_elements ,  evt , data ) 
    term.value = data  
    mm.disable = true  
    run_summary.disabled=false  
    term.style.color ="red"
   // status.style.color ="red"
    //status.innerHTML =`<i class="fa fa-times" aria-hidden="true"></i> failure ` 
    //bar_progress.style.backgroundColor = "firebrick"
    stop_blink_on_faillure(analysis_on_going  ,  false ) 
}) 
ipcRenderer.on("logerr::notfound" , (evt , data)  => {
    data = fetch_right_data ( activate_extra_elements , evt  ,data ) 
    term.value = data 
    run_summary.disabled=false 
    term.style.color ="red"
    //status.style.color ="red"
    //status.innerHTML =`<i class="fa fa-times" aria-hidden="true"></i> error log not found`
    //bar_progress.style.backgroundColor = "firebrick"
    stop_blink_on_faillure(analysis_on_going  , false) 
}) 
ipcRenderer.on("term::logerr"     , (evt , data)  => {
    data = fetch_right_data ( activate_extra_elements , evt  ,data ) 
    term.value = data 
    run_summary.disabled=false 
    term.style.color   ="whitesmoke"
   // status.style.color ="red"
    //status.innerHTML =`<i class="fa fa-times" aria-hidden="true"></i> An error has occurred  ` 
    //bar_progress.style.backgroundColor = "firebrick"
    stop_blink_on_faillure(analysis_on_going  ,  false) 
})  
ipcRenderer.on("log::broken"      , (evt , data)  => {
    data = fetch_right_data ( activate_extra_elements , evt  ,data ) 
    term.value = data  
    run_summary.disabled = false  
}) 
run_analysis.addEventListener("click" ,  evt => { 
    evt.preventDefault()
    term.focus()
    let  annoucement =  ""
  
    if (!is_it_correct && is_it_correct != null)  
    {
        annoucement = `✘ Error on marker set  syntax eg 1,3,23\n` 
        term_write(annoucement , warning = true )  
        //bar_progress.style.backgroundColor="orange"
        return 
    }
    if   ( mm.checked && markerset.value=="" )   
    {
        annoucement = "require marker set indexation to proceed ... \n"
        term_write (annoucement , warning= true ) 
        //bar_progress.style.backgroundColor="orange"
        return 
    }
    //status.innerHTML =`<i class="fa fa-spinner fa-pulse fa-1x fa-fw"></i> processing ...`
    //status.style.color = "blue"   
    //bar_progress.style.backgroundColor = "limegreen"  
    annoucement ="▮ Running Analysis"
    term_write(annoucement) 
    analysis_on_going = true 
    //setInterval(plugonlog , term_display_speed)   
     
    log("number simulation" ,   nbsim.value)  
    let gobject  =  { 
        paths           :paths_collections ?? null ,
        selected_index  :  { 
            ped        : ped_  
            ,map        : map_  
            ,phen       : phen_ 
            ,phenotype_ : phenotype.options[phenotype.selectedIndex].value ||   null  
            ,nbsim_     : nbsim.value     || 0  
            ,nbcores_   : nbcores.options[nbcores.selectedIndex].value  ||  0 
            ,mm         : _mm 
            ,sm         : _sm 
            ,markerset  : _mm? markerset.value : null 
        }  
    }

    const { selected_index } = gobject 
  
    const  {phenotype_, nbsim_, nbcores_}  = selected_index  
    const  require_needed   = [ phenotype_ ,  nbsim_ , nbcores_ ]  
    const  done  =  is_satisfied(require_needed)
   
    if   ( !done ) 
    {   
        annoucement="❗Run analysis  need to be satisfied" 
        term_write (annoucement ,  true )   
    
    }  else {  
        run_analysis.disabled =  true
        if (!nbcores.disabled) 
        { 
            notify("memory cpus" , { body : `${nbcores_} are  stimulated`})
            //use_cpus_resources(true) 
        } 

        processing.classList.toggle("active") 
        ipcRenderer.send_("annoucement" , annoucement) 
        
        ipcRenderer.send_("run::analysis" ,  gobject )
    }
})

ipcRenderer.on("run::analysis::done"  , ec =>  { processing.classList.toggle("active")}) 

//--------------- TERMINAL  -----------------------------
let detach_term = _.querySelector("#detach_term")  ,  
    taa         = _.querySelector("#term_ascii_art") , 
    container_attached = _.querySelector("#term_area"),
    term_footprint =  term  , 
    is_detached  = false

detach_term.addEventListener("click" , evt =>  {
     //send signal to create full terminal emulator    
    if  ( activate_extra_elements )  
    {
        is_detached = true  
    
    }
    if  ( !is_detached )  
    {   
        
        const  mirror_cpy  = term.value   
        ipcRenderer.send("detach::term", mirror_cpy)
        //container_attached.removeChild(term) 
        term.hidden  = true 
        taa.removeAttribute("hidden") 
        detach_term.title ="close  the terminal window to bring back it >_ "  
        detach_term.disable=true
        is_detached  = true 
        
      
    }
    /*
        ipcRenderer.send("attach::term ", false) 
        //container_attached.appendChild(term_footprint) 
           } */  
})

ipcRenderer.on("attach::term" , (evt ,data ) => {
    detach_term.disabled = false  
    detach_term.title = "detach term" 
    term.hidden  = false
    taa.setAttribute("hidden"  , true)  
    is_detached = false  
}) 

ipcRenderer.on("annoucement" ,  (evt , data )  => { 
} )

__USING_WEB_SOCKET__ : 

if  (activate_extra_elements) 
{
    const dispatch_server_info  =  server_information_packet => { 
        const   { ascii_logo ,  sysinfo }  = server_information_packet
       
        term_write(ascii_logo ,  false ,false) 
        if  ( paths_collections?.split)  
        {
            sysinfo["session"]  =paths_collections.split("/").at(-1)   
            if ( gobject.selected_files !=  (void function ()  { return  }() ))  
            { 
                sysinfo["Recent files"]  =  gobject.selected_files  
            }
        }else  
            sysinfo["session"]  = "no job"
        let formating_received_information=  "---------\n" 
        for  ( let type  in sysinfo )  {
            
            if  ( type != "range") 
                formating_received_information +=`+ ${type}\t: ${sysinfo[type]}\n` 
        }
        formating_received_information+="----------\n" 
        term_write(formating_received_information , false , false , false  ) 
        term_write(`
        All outputs are displayed in the terminal.\n
        Some basic commands are available like “ls” or “clear” click on >_m-tdterm and type help for more detail.\n
            More commands will be added so the user can have access to their directory\n`
            , false, false )
        return  sysinfo.cpus   
    } 
    
    ipcRenderer.on( "init" ,   server_information=>   {
        term.value = "" 
        job_title.focus ()
        const available_cpus = dispatch_server_info(server_information)
        //dispatch cpus core  on select > option
        let  cpus =  range(available_cpus)  
        for  ( let cpu  in  cpus.slice(1) ) 
        {  
            if (isNaN(parseInt(cpu)) ) break 
            let option = _.createElement("option") 
            option.textContent=  parseInt(cpu) + 1    
            nbcores.add(option)
        
        }
        
    }) 
    
    ipcRenderer.on("info" ,   server_information => dispatch_server_info(server_information) )  
     
    let  files_buffer =  null   
    let  fileslist  =  null  
    files_browser.addEventListener("change" , evt =>  {  
        
        const choosed_files  =  [...files_browser.files]  ,
            total_size_bytes  =  choosed_files.reduce( ( file_a , file_v  ) => file_a?.size  + file_v?.size ) 

        files_uploaders.disabled =  !choosed_files.length  ??   true    
        fileslist  = choosed_files.map (  file  =>  file?.name) 
     
    
    }  , false ) 
 
        form_upload.addEventListener("submit" , async  evt =>  {    
            evt.preventDefault()  
            setTimeout( _=> {  log("...")} , 60000) 
            let responce_status = await   uploader(form_upload)
            files_browser.value = ""
            if   (responce_status?.status  ==  200    && fileslist != null) 
            {   
                
                optsfeed(fileslist)  
                ipcRenderer.send_("update::fileviewer" ,   paths_collections )  
                carousel_next.click() 
            }
        }) 
    
    ipcRenderer.on("jobusy" ,   vn => {
         localStorage.clear()
         let allow_upload = false  
         files_browser.disabled = true
         term.value = "" 
         term_write ( "----------\n->[WARNING] ! your not  allowed to upload filse this  job is being user by another"  ,  true , false , false )  
         disconnect.disabled = true  
         job_title.style.color = "firebrick"
    })  

    ipcRenderer.on("fsinfo" ,  dmesg => term_write(dmesg  ,  true  ,false , false)  )  

    ipcRenderer.on("ok", protocol => { 
        disconnect.disabled = false 
        files_uploaders.disabled=false 
        files_browser.disabled = false  
        job_title.style.color ="#22222"
        job_init.value        ="ready"
        job_init.disabled     =true 
        job_title.disabled    =true
        files_uploader.disabled = false 
        files_browser.disabled= false 
    })

    ipcRenderer.on("session::expired"  ,  dmesg  =>  {  
        //term_write(`\n * ${dmesg}  please set a new job ` , false , false  , false ) 
        localStorage.clear()
        sleep ( 1000 ,location.reload())  
    })  

    ipcRenderer.on("update::fileviewer" ,   fileslist  =>  {
        //! TODO :  update file views  rendering 
        if  ( fileslist  && localStorage["task"])  
        {
            log ("filebuffer" , fileslist ) 
            files_buffer  = fileslist  
        }
    } ) 

    disconnect.addEventListener("click"  ,  evt =>   { 
        if  (localStorage["task"] )  
        {
            localStorage.clear()  
            ipcRenderer.send_("client::disconnect" ,  paths_collections); 
            sleep(1000,  ()=> term_write("[  Good bye ] "))
            evt.preventDefault()
            sleep(2000  ,  () =>  {   
                term.value=""
                location.reload()
            }) 
        }
         
    })
     
    p_menu.forEach( pm =>   { 
        pm.addEventListener("mouseover" ,  evt => pm.classList.toggle("active")) 
        pm.addEventListener("mouseout"  ,  evt => pm.classList.toggle("active"))  
    })


    let  edition_mode =  false 
    interm.addEventListener ("click" , evt => { 
        edition_mode  = ~edition_mode  
        if (edition_mode) 
        {
            interm.classList.add("inverted")
            term.disabled = false
            term.focus() 
            term.value    ="> " 
            term.addEventListener("keydown"  , evt => {
                if  ( evt.which == 0x000d ) //! enter ascii   
                {
                    const  user_cmd  = mtdterm_rowline_handlers(evt.which)
                    if ( user_cmd.length )  
                        ipcRenderer.send_("user::interaction" ,  user_cmd  )  
                    else{  
                        //!  add   prompter 
                        setTimeout( ()  =>  term.value +="> "  , 10 )  
                    }
                }
            })
        }else { 
            if ( interm.classList.contains("inverted") ) interm.classList.remove("inverted") 
            term.disabled  = true 
        
        } 
    })

    ipcRenderer.on("cmd::notFound" ,  notFoundmesg =>    { 
        term_write(notFoundmesg ,  true  , false )  
        term.value+="> "
    })

    ipcRenderer.on("tcmd::response" ,  result   => {
        if (result.includes("GET")) 
        {  
            result+='\n'
            const  [,file]  = result.split(" ")
            download.href=`/download/${file}` 
            setTimeout  ( () =>  { 
            download.click()
            } , 1000) 
        }
        if   (result == " ")  
        {   
            term.value= "\n> "
             return  
        }
        if   ( Array.isArray(result)  ) 
        {
            let  d = "" 
            for  ( let  cmd_describ of  result )  
            {
                  d +=cmd_describ    
            }
            d+="\n> " 
            term_write(d , false , false ,  false)  
        }else 
            term_write(`${result??''}\n> `,false  , false , true)
        
    }) 

    
    let gi_status  =   { 
        "no" : 0 , 
        "yes": 1  
    } ;  

    //!  GENOTYPE  INFERENCE   
    [giyes,gino]["forEach"] ((gi_btn, gi_code_index )   =>   { 
        gi_btn.addEventListener("click" , evt => {
            evt.preventDefault()  
            let gi_status = gi_code_index^1  
            if  (gi_status >  0 )  
            {
                //!TODO : SEND  CODE TO RUN GI  ...  
                
                term_write("GENOTYPE INFERENCE" ,false , false)  
                if ( Object.keys(gobject).length ==0 )  
                { 
                    term_write("WARNING : are you trying to run GI without  summary static !!") 
                    carousel_prev.click() 
                    return  
                } 
                processing.classList.toggle("active")  
                ipcRenderer.send_("gi::run" , [gi_status ,  gobject])  
                return  
            }
            //!NOTE  : go directly to the next carousel 
            log(gobject)  
            carousel_next.click()  
            
             
        })
    }) 
   
    //!NOTE :  go next carrousel  if  succes  
    ipcRenderer.on("next" , _ =>  { 
        if  ( processing.classList.contains("active"))  
            processing.classList.remove("active")  

        carousel_next.click()  
    })
    let modals   = [..._.querySelectorAll(".modal")]  
    
    let [ modal , modal2 ] =  modals 
    
    ipcRenderer.on("gi::done" ,  ec =>  { 
        processing.classList.toggle("active")  
         log ("gi run  done " ) 
         if (!modal.classList.contains("active"))  
          { 
            modal.classList.add("active") 
            carousel_next.disabled=true 
            carousel_prev.disabled=true
          } 
    }) 
    
    let modal_response  = [ gi_modal_yes ,gi_modal_no]    
    modal_response.forEach( ( response_action , index_code ) => {
        response_action.addEventListener("click"  , evt =>  { 
            let allowed_ans = ["no", "yes"]
            let response = index_code^1 ;
            log (response  , "-> " ,  allowed_ans.at(response))    
            
            if  (modal.classList.contains("active"))  
            { 
                modal.classList.remove("active")  
                carousel_next.disabled = false 
                carousel_prev.disabled = false 
                
            }  
            //! send the responce to the server 
            processing.classList.toggle("active")  
            ipcRenderer.send_("trigger::select_pedfile" ,allowed_ans.at(response)) 
            
        })
    })

    //! ANALYSIS HANDLER   ... 
    let trunbtn = _.querySelector(".t-run")   //!  therical button  
    let erunbtn = _.querySelector(".e-run")   //!  emperical button  
    
    let analysis_btns =[erunbtn ,  trunbtn] 

    analysis_btns.map((Abtns ,  index_code) =>  {
        Abtns.addEventListener("click" , evt => {  
            if  ( index_code   > 0 )   //!  Theorical    
            {
                ipcRenderer.send_ ("enable:trun", true ) 
                nbcores.value  = 1 
                nbsim.value    = 0 
                carousel_next.click() 
                return  
            }  
            

            //!activate model for settings if  is emperical  
            if  (  !modal2.classList.contains("active") )
            {
                modal2.classList.add("active")  
                carousel_next.disabled = true  
                carousel_prev.disabled = true  
            }
            
        }) 
    })   

    //! ANALYSIS MODAL   ... 
    let  analysis_modal2_action  =  [cancel_analysis , proceed_analysis ] 
    analysis_modal2_action.map((whichbtn ,  index_code ) => { 
        
        whichbtn.addEventListener("click"  , evt  => { 
            if  (  index_code == 1  )   
            {   
                carousel_next.disabled=false 
                carousel_next.click()   
            }  
            modal2.classList.toggle("active") 
            carousel_next.disabled  = false 
            carousel_prev.disabled  = false 

        }) 
    })

    /*
    trunbtn.addEventListener("click"  , evt => { 
        if  (trunbtn.classList.contains("toggle") && enable_switch_between_theorical_or_emperical )
        {
            trunbtn.classList.remove("toggle")  
            nbcores.disabled = false 
            nbsim.disabled   = false  
            ipcRenderer.send_("enable::trun" ,  false )  
        }else{  
            trunbtn.classList.add("toggle")  
            nbcores.disabled = true  
            nbsim.disabled   = true  
            ipcRenderer.send_("enable::trun" ,  true )  
        } 
        
        carousel_next.click()  
    })

 */
    //! zoomin and zoom out  
    const  zooms  =  [ zoom_out ,  zoom_in ] 
    const LIMTE_FSIZE  = [ 6, 24]  
    zooms.map ( (zoom_operation  , z_index )  =>   { 
        zoom_operation.addEventListener("click" , evt => {
            let  term_fontsize =  parseInt(window.getComputedStyle(term).getPropertyValue("font-size"))  
            if  ( z_index ==  0   && term_fontsize  >=LIMTE_FSIZE[z_index] )  
            { 
                term.style.fontSize =  term_fontsize + 2 +"px"  
            }
            if  ( z_index ==  1   && term_fontsize  <= LIMTE_FSIZE[z_index] ) 
            {  
                term.style.fontSize = term_fontsize - 2 +"px"
            } 
        })
    })

    DOWNLOAD:  
    //! Downloading user assets 
    download_assets.addEventListener("click" , evt => { ipcRenderer.send_("download::assets"  , paths_collections)})

    
    ipcRenderer.on("NOULD" ,   _=>  {term_write("No jobs defined Sorry!!" , false , true , true )}) 

    //! Trigger  Dowload 
    ipcRenderer.on("compress::assets::available" ,  async  assets => {  

        const  item  = assets.split("/").at(-1) 
        log ("item -> " , item )  
        const  retrive_native_url  =  await fetch(`/download/${item}`) 
        let  hidden_link  = _.createElement('a') 
        hidden_link.href =  retrive_native_url.url   
        hidden_link.download = item  
        _.body.appendChild(hidden_link)
        hidden_link.click() 
        hidden_link.remove() 
        
    }) 


   carousel_navigation(false)    
}
