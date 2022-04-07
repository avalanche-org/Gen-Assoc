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
    
    ,i_lock ,i_unlock ,blur_area, status, microchip , bar_progress
    ,__lock_web_ui_file_operation 
    ,log , error,warn
    ,random , floor  

    ,window_keyShortcut,shortcup_maping  

}  from  "./ops.js"   
console.log(_) 
console.log(activate_extra_elements) 
console.log(notify) 
console.log(ipcRenderer) 
console.log(ped) 



__setup_ipcRenderer(ipcRenderer)  
__lock_web_ui_file_operation()  

ipcRenderer.send_("clifp" ,   { user_agent : client_nav_fingerprint(navigator) , ls_session : localStorage["task"]?? null})


if (!localStorage["task"] )   
{
    files_browser.disabled  = true
    files_uploader.disabled =  true
    job_init.addEventListener("click" , evt  => {
        evt.preventDefault()  
        if (!job_title.value) files_browser.disabled = true  
        if (job_title.value)  
            ipcRenderer.send_("create::job"  ,  job_title.value )  
    })
}  
if  ( localStorage["task"] )
{
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
    run_analysis.disabled =  true  
    term.innerText        =  "▮ "
    term.setEditable      =  false
    term.disabled         =  true 
    phenotype.disabled    =  true 
    nbsim.disabled        =  true 
    nbcores.disabled      =  true 
    mm.disabled           =  true 
    markerset.disabled    =  true
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
    }else {
        markerset.style.backgroundColor ="firebrick"
        markerset.style.color = "black"
        is_it_correct         = false
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
        term.value +=`${incomming_data}\n`
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
    
    const  { main_root  , files  } = global_object  
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
mm.addEventListener("change" , evt => {
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
/*  Abort Execution Event send kill signal 
 *  through socker  
 **/  
abort.addEventListener("click"  , evt=>  { 
    ipcRenderer.send_("kill"  ,   null)
}) 

window_keyShortcut(shortcup_maping["ctrl_c"] ,  action =>  {
    ipcRenderer.send_("kill" , null )  
}) 





let ped_  = null , 
    map_  = null ,
    phen_ = null   

let summary_already_run =  false , 
    analysis_on_going   =  false   

run_summary.addEventListener("click" , evt => {
    evt.preventDefault()
    let  annoucement  = "▮ Generating Summary Statistics ... please wait\n" 
    let  warning_alert = false  
    //plugonlog() 
    //setInterval(plugonlog , term_display_speed)    
    //status.innerHTML =`<i class="fa fa-spinner fa-pulse fa-1x fa-fw"></i> processing ...`
    //status.style.color = "blue"   
    //bar_progress.style.backgroundColor = "limegreen"   
    run_analysis.disabled = true 
    run_summary.disabled  = false   
    let gobject ={ 
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
        ipcRenderer.send_("run::summary",  gobject ) 
    } 
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
ipcRenderer.on("load::phenotype" ,  (evt ,  incomming_data ) =>  {
    phenotype.innerHTML = ""  
    nbcores.disabled =  false 
    incomming_data = fetch_right_data ( activate_extra_elements ,  evt , incomming_data)   
    term_write (`total phenotype ${incomming_data}` )
    for  ( let phen_index  of range(incomming_data )) { 
        const phenotype_opts = _.createElement("option")  
        phenotype_opts.text      =  phen_index  
        phenotype_opts.value     =  phen_index
        phenotype.add(phenotype_opts)   
    } 
     
    enable_switch_between_theorical_or_emperical  = true 
})



//FIXES [X]  double double  buffering on Terminal   #15 
let force_buffer_clean =   ""  
ipcRenderer.on("term::logout" , ( evt , data ) => {
    data = fetch_right_data ( activate_extra_elements ,  evt ,data )  

    term.focus() 
    if (summary_already_run)  
    {  
        //progress_step(47 , "finishing ", 140)
    }
    if (analysis_on_going)
    {  
        //progress_step(99 , "Analysising ... ", 240)
        //use_cpus_resources(false) 
    }  
    ////progress_step(45 , 10)   
    
    if  (data) 
    { 
        term_write(data) 
       // run_summary.disabled  = summary_already_run 
        //term.value = data
        follow_scrollbar()  
        run_analysis.disabled = !summary_already_run  
        phenotype.disabled    = !summary_already_run  
        nbsim.disabled        = !summary_already_run
        i_lock.classList.remove("fa-lock") 
        i_lock.classList.add("fa-unlock") 
        mm.disabled            =  false 
        blur_area.style.filter = "blur(0px)"
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
    term.style.color   ="red"
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
     
    
    let gobject  =  { 
        paths           :paths_collections ?? null ,
        selected_index  :  { 
            ped        : ped_  
            ,map        : map_  
            ,phen       : phen_ 
            ,phenotype_ : phenotype.options[phenotype.selectedIndex].value ?? null  
            ,nbsim_     : nbsim.value     || 0  
            ,nbcores_   : nbcores.options[nbcores.selectedIndex].value  ||  null  
            ,mm         : mm.checked
            ,sm         : sm.checked
            ,markerset  : mm.checked ? markerset.value : null 
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

        ipcRenderer.send_("annoucement" , annoucement) 
        ipcRenderer.send_("run::analysis" ,  gobject )
    }
})


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
        let formating_received_information=  "---------\n" 
        for  ( let type  in sysinfo )  {
            log(sysinfo)  
            log(type) 
            if  ( type != "range") 
                formating_received_information +=`+ ${type}\t:\t${sysinfo[type]}\n` 
        }
        formating_received_information+="----------\n" 
        term_write(formating_received_information , false , false , false  ) 
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
     
    let  fileslist  =  null  
    files_browser.addEventListener("change" , evt =>  {  
        
        const choosed_files  =  [...files_browser.files]  ,
            total_size_bytes  =  choosed_files.reduce( ( file_a , file_v  ) => file_a?.size  + file_v?.size ) 
            
        log(choosed_files )  
        files_uploaders.disabled =  !choosed_files.length  ??   true    
        log(files_uploaders.disabled )  
        fileslist  = choosed_files.map (  file  =>  file?.name) 
        log (fileslist) 
    
    }  , false ) 
 
    if  ( localStorage["task"]  ) 
    {
        form_upload.addEventListener("submit" , async  evt =>  {    
            evt.preventDefault()  
            let responce_status = await   uploader(form_upload) 
            files_browser.value = ""
            if   (responce_status?.status  ==  200    && fileslist != null) 
            { 
                optsfeed(fileslist)  
                // update  file visualization  
                ipcRenderer.send_("update::fileviewer" ,   paths_collections )  
            }
        }) 
    }
    
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
        log (fileslist ) 
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
            term.value= "> "
             return  
        }
        if   ( Array.isArray(result)  ) 
        {
            let  d = "" 
            for  ( let  cmd_describ of  result )  
            {
                  d +=cmd_describ    
            }
            d+="> " 
            term_write(d , false , false ,  false)  
        }else 
            term_write(`${result??''}> `,false  , false , true)
        
    }) 

    //! Genotype inference  
    
    let gi_status  =   { 
        "no" : 0 , 
        "yes": 1  
    } ;  

    [giyes , gino]["forEach"] (gi_btn =>   { 
        gi_btn.addEventListener("click" , evt => {
            evt.preventDefault()  
            const  gi_value  =  gi_btn.textContent.toLowerCase()  
            if (gi_status[gi_value]) 
            {
                gino.classList.remove("negative") 
                evt.target.classList.add("positive")
            }else {  
                giyes.classList.remove("positive")  
                evt.target.classList.add("negative") 
            }
            ipcRenderer.send_("retrive::missing::genotype" ,   gi_status[gi_value])  
        })
    })
    //  Theorical run 
    let trunbtn = _.querySelector(".t-run") 
    
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
    })

    
}
