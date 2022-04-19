/** 
 * author  :   Umar aka <jukoo>    <github.com/jukoo> 
 * filename:   mtdt_server.js 
 * description : Mtdt  Http  Server   with Socket io   
 */ 

mtdtart = `
---
 ███╗   ███╗████████╗██████╗ ████████╗
 ████╗ ████║╚══██╔══╝██╔══██╗╚══██╔══╝
 ██╔████╔██║   ██║   ██║  ██║   ██║   
 ██║╚██╔╝██║   ██║   ██║  ██║   ██║   
 ██║ ╚═╝ ██║   ██║   ██████╔╝   ██║   
 ╚═╝     ╚═╝   ╚═╝   ╚═════╝    ╚═╝ 
\t\t\t\t* version  beta 4.5.2 
`

__kernel_file__          : { core  = require("./kernel")  }  
__kernel_file_props__    : { 
        nm    = core["@node_module"] ,
        cfg   = core["@config"]      ,
        xtra  = core["@extra"]       ,  
        libs  = core["@libs"]         
} 

so = process.platform == "win32" ? "\\"  : "/"  

const  [
    { log }  = console                  , 
    {summary_src  , run_analysis  , required_file_extension } = require("./config.json")["mtdt_pannel"], 
    {virtual_workstation  , sandbox} =  require("./config.json")["web_server"] , 
    {Server} = require("http")           ,
    path     = require("path")           ,
    {createReadStream,access , createWriteStream ,readFile  , writeFile  , writeFileSync, constants} =nm["fs"]         , 
    {utils , tcmd }  = libs              , 
    xpress   = xtra["xpress"]            ,
    xpressfu = xtra["xpressfu"]          ,  
    ios      = xtra["io_socket"].Server    
] = process.argv.slice(0xa) 

__setup__  :  
xapp   = xpress()
server = Server(xapp) 
socket =  new ios(server)   //  binding  
gateways=process.env?.PORT  || 4000  

__config__ :
xapp
.set("view engine" ,  "ejs" )
.set("views" , __dirname)   
.use(xpress.static(__dirname+"/assets"))  
.use(xpress.json()) 
.use(xpress.urlencoded({ extended: true } )) 
.use(xpressfu({})) 

__required_static_files__ : 
summary_source  =  utils.auto_insject(path.join(__dirname,  ".." ) , summary_src)  
run_analyser    =  utils.auto_insject(path.join(__dirname,  ".." ) , run_analysis) 
vworks          =  utils.auto_insject(path.join(__dirname)  , virtual_workstation)
sbox            =  utils.auto_insject(path.join(__dirname)  , sandbox)
static_vn       =  null
local_namespace =  (void function ()  { return }()) 
vwo             =   {}  

download_item_status_fail =  false 
/** @namespace __wtcp__ **/
const __wtcp__ =  {  

    "#fstream"   :   file  => {
        const virtual_space =  vworks.split("/").splice(-1)[0]  

        let  location_path  = static_vn != null  ?  `${virtual_space}/${static_vn}/${file.name}` : `${virtual_space}/${file.name}`  

        writeFile( location_path  ,  file.data  , ( err , data) => { 
            if  (err ) throw err  
        }) 
    
    } , 
    "@parser"   :   ( data  , sep ="." ) => {
        const  explode = data.split(sep) 
        return  required_file_extension.includes(explode[explode.length -1 ] )  
    },

    files_upload_processing   :   ( fu  , callback_handler  = false )   =>  { 
        let   gfiles =[]   
        if  ( typeof(fu) == "object"  &&   !fu.length     ) gfiles =  [[ ...gfiles ,    fu]]   
        if  ( typeof(fu) == "object"  &&   fu.length >= 1  ) gfiles =  [[ ...gfiles , ...fu]] 
        const  file_len  =  gfiles[0].length   
        let  i =  0 
        gfiles[0]
        ["forEach"](   ( file   , index  ) => {
            if  (callback_handler)  callback_handler(file)
            i  = index +1 
        })
        return  file_len ==  i 
    },  
    
    mtdt_server  : () => {

        xapp
        ["get"] ("/" , ( rx , tx  )  =>    { 
            
            tx.setHeader("Content-type" ,  "text/html")  
            tx.render("index.ejs"  ,  { socket : true })  
       
        })
        ["post"] ("/",  ( rx  ,tx  ) => {  

            const { files_upload_processing  }  = __wtcp__ 
            if (!rx?.files ) log ("file upload module not found ")  
            let  { fupload  }  = rx.files

            fupload  =  fupload.length ? fupload.filter( file  => __wtcp__["@parser"](file.name)):
            [fupload].filter(file  => __wtcp__["@parser"](fupload.name))
            
            
            if  ( files_upload_processing (fupload  ,   __wtcp__["#fstream"]) ) 
                tx.redirect("/") 
            
            else tx.status(500).send({ message  :"Upload Broken :  fail to upload  file (s) !"})
        
        })
        ["get"]("/download/:dfile" , ( rx ,tx ) => {
            log (sbox)  
            tx.download(`${sbox}/${rx.params.dfile}` , rx.params.dfiles  , err  => { 
                if(err)  
                { 
                   tx.status(404).send( {  message  : `you tried to download an inexistant file `}) 
                }
            })
        })
        ["use"]((rx , tx  , next )   =>  tx.redirect("/"))
       
        server 
        ["listen"](gateways ,"0.0.0.0" , _void_args  => {  
            utils["_auto_build_tmp_dir"](vworks)  
            utils["_auto_build_tmp_dir"](sbox) 
            log(`\x1b[1;32m * connected on  ${gateways}\x1b[0m`)
            basename =  process.argv[1].split(so).splice(-1) 
            const  additional_infomation_server  =  {  
                ["server::name"]    : basename[0] , 
                ["connection::type"]: "tcp" ,
                ["port::gateway"]   : `0.0.0.0::${gateways}` , 
                status              : "online" 
            }
            console.table(additional_infomation_server)  

                
        })
        ["on"]("error" , err=> {  
            switch (err.errno)   
            {
                case  -98  :  //!EADDRINUSE  
                    log (`\x1b[1;33m -*this gatewaye ${gateways} is already used by  \x1b[4m ${process.argv[1]} \x1b[0m`) 
                    process.exit(err.errno) 
            }
        }) 
        
        socket.on("connection" , sock => { 
            __client_side_evt__  : 
            
            NAVIGATOR_FPRINT  :   sock.on("clifp"  ,  fprint => { 
                 const  {  user_agent   ,  ls_session  } = fprint  
                 log  (user_agent) 
                 if  ( ls_session )  
                 {
                     static_vn  =  ls_session.split(`${so}`).slice(-1)
                     setTimeout  ( ()=> { 
                         utils.scan_directory(ls_session,  "ped" , "map" ,"phen")
                         .then ( res =>   { 
                             sock.emit("Browse::single" ,   { main_root  :  ls_session ,  files  : res})
                             sock.emit("update::fileviewer" ,   res  )
                         })
                         .catch( error =>  sock.emit("session::expired" , "session expired since ..." ))  
                        }, 1000)
                 }
                 vwo[local_namespace]  = ls_session ??   (void function  () { return }  () ) 
             })  
            VIRTUAL_NAMESPACE   :  sock.on("create::job" ,   async   namespace  =>  {
                local_namespace      =  namespace.replace(" " , "_")
                let job_stack  = await utils.list_allocated_job_space() 
                job_stack      =  job_stack.map(dirent => dirent.name) 
                if  (  !job_stack.includes(local_namespace)  )  
                {
                    utils.access_userland ( vworks , local_namespace  , sock )
                    static_vn =  local_namespace 
                    absvpath  =`${vworks}/${local_namespace}` 
                    vwo[local_namespace] =  absvpath  
                    const   { scan_directory  } =  utils
                    //! wait until   to create   the env  namespace 
                    setTimeout  ( ()=> { 
                    scan_directory(absvpath   ,  "ped" , "map" ,"phen")  
                    .then ( res =>   {  
                        sock.emit("Browse::single" ,   { main_root  :  absvpath ,  files  : res})
                        sock.emit("update::fileviewer" ,   res  )  
                         })
                    }, 2000)
                }else {    
                    sock.emit("jobusy" ,local_namespace )  
                } 
            }) 
            
            FILE_VISUALIZER  :  sock.on("update::fileviewer" ,   async  virtual_namespace   => {
     
                static_vn   = virtual_namespace.split(`${so}`).slice(-1) 
                let  files  =   await  utils.list_allocated_job_space(true ,  virtual_namespace )  
                files       = files.map(dirent=> dirent.name)  
                sock.emit("update::fileviewer" ,   files)  
            })

            RELEASE_JOB  :  sock.on("client::disconnect" , path_collection  => {
                utils.unset_job_space(path_collection) 
                sock.disconnect() 
            }) 
             
            RUN_SUMMARY : sock.on("run::summary" ,  gobject   => { 
                log ( "summary  run  - > " ,  gobject) 
                let   { paths ,  selected_files  } = gobject  ,   
                      [pedfile,mapfile,phenfile]  = selected_files
                
                const  summary_arguments_flags  =  { 
                    pedfile  :  `${paths}/${pedfile}`
                    ,mapfile  :  `${paths}/${mapfile}`
                    ,phenfile :  `${paths}/${phenfile}`
                } 
                utils.rsv_file(summary_arguments_flags?.phenfile ,  '\t')
                .then(res => {
                    utils.std_ofstream(paths ,  utils.scripts(summary_source, {...summary_arguments_flags})   ,sock,
                        exit_code => {
                            if  (exit_code == 0x00)  
                            {   
                                sock.emit("load::phenotype"  ,  res-2)  
                            }else{   
                                log("fail")   
                            }  
                        })
                }) 
            })

            gi_state  =  0  //! by default the gi is <empty_string>   
            theorical = false 
            sock.on("retrive::missing::genotype"   , gi => {gi_state =  gi})        
            sock.on("enable::trun" ,  is_theorical_enable => {  theorical =   is_theorical_enable } )  
          
            RUN_ANALYSYS :   sock.on("run::analysis" ,  gobject => {
                const { paths  , selected_index  }  = gobject,
                     {  mm    , sm , ped , map , phen , phenotype_,  nbsim_ , nbcores_ , markerset }  = selected_index, 
                     [  pedfile , mapfile , phenfile  ] = [ `${paths}/${ped}` , `${paths}/${map}`,`${paths}/${phen}` ]  

                console.table(selected_index)  
                    log ( "phen path " , phenfile  ) 
                let user_namespace  =  paths.split(so).slice(-1)[0] 
                
                let  analysis_argument_flags = {}    
                if (mm && markerset!= null && markerset != '')  
                { 
                    analysis_argument_flags  =  {  
                        "pedfile"    :  pedfile 
                        ,"mapfile"   :  mapfile
                        ,"phenfile"  :  phenfile 
                        ,"phen"      :  phenotype_
                        ,"nbsim"     :  nbsim_
                        ,"nbcores"   :  nbcores_
                        ,"markerset" :  markerset
                        ,"gi"        :  gi_state 
                        ,"jobtitle"  :  user_namespace
                    }  
                    if  ( theorical ) 
                    {
                        delete  analysis_argument_flags?.nbsim    
                        delete  analysis_argument_flags?.nbcores  
                    }
                } 
                
                if  (sm)  
                {
                    analysis_argument_flags  =  {  
                        "pedfile"    :  pedfile 
                        ,"mapfile"   :  mapfile
                        ,"phenfile"  :  phenfile 
                        ,"phen"      :  phenotype_
                        ,"nbcores"   :  nbcores_
                        ,"gi"        :  gi_state 
                        ,"jobtitle"  :  user_namespace 
                    } 
                    if  (theorical) 
                         delete  analysis_argument_flags?.nbcores_  

                }
                log ("th" ,  theorical) 
                utils.std_ofstream(paths ,   utils.scripts(run_analyser  , {  ...analysis_argument_flags }  )  ,  sock ,   exit_code  => {
                    if(exit_code ==0x00) 
                    {
                        log("exit" , exit_code )
                    }else {
                        log("error") 
                    }
                })

            })
            
            //!  Trigger   download assets  
            sock.on("download::assets" ,  userland  =>  {
                if ( !userland || userland.length  == 0  )   
                { 
                    sock.emit("NOULD" ,  null)
                    return  
                } 
                //! otherwise  let compress the contains and send it
                const payload  = [sock , userland]  
                let compressed_location_data  = utils.compress(payload)
                sock.emit("compress::assets::available"  ,  compressed_location_data)   

            }) 
            //!  listen kill  signal 
            sock.on("kill" , _=> utils.kill_subprocess() )  

            __server_side_evt__  :  
            
             server_static_info = {  
                ascii_logo : mtdtart , 
                sysinfo    : utils["cpus_core"](true) 
            }  
            INIT              :  sock.emit("init" ,   server_static_info)  
            SERVER_INFO       :  sock.on("info" , info_request => { 
                sock.emit("info", server_static_info) 
            
            }) 
            
            TERMINAL_INTERACTION : 

            sock.on("user::interaction" , cmd  => {
                const  allowed_commands  =  Object.keys(tcmd) 
                let   [ argv0 , ...argslist ]  = [ ...cmd.split(" ") ]

                if  ( argv0  == "ls" ) argslist = vwo[local_namespace]   
                if  ( argv0  == "cat") argslist = [vwo[local_namespace], ...argslist]  
                if  ( argv0  == "get") argslist = [vwo[local_namespace], ...argslist]  
               
                if (!allowed_commands.includes(argv0) )  
                {
                    sock.emit("cmd::notFound" ,  `mTDTerm  ${argv0} : command not found\n`)
                }
                if  ( tcmd[argv0])  
                {
                     sock.emit("tcmd::response"  , tcmd[argv0](argslist)?.data || " ")  
                }
             }) 
            
        })

    }
    
}

__wtcp__.mtdt_server()
