/**!  web Tcp  server  socket   
 *    for  synchronous exchange    
 *    ----
 *    author  :   Umar aka < jukoo >  @  github.com/jukoo  
 */ 

__kernel_file__          : { core  = require("./kernel")  }  
__kernel_file_props__    : { 
        nm    = core["@node_module"] ,
        cfg   = core["@config"]      ,
        xtra  = core["@extra"]       ,  
        libs  = core["@libs"]
} 

so = process.platform == "win32" ? "\\"  : "/"  

const  [
    {summary_src  , run_analysis  , required_file_extension } = require("./config.json")["mtdt_pannel"], 
    { log }  = console                   , 
    {Server} = require("http")           ,
    path     = require("path")           ,
    {createReadStream,access , createWriteStream ,readFile  , writeFile  , writeFileSync, constants} =nm["fs"]         , 
    {utils}  = libs                      , 
    xpress   = xtra["xpress"]            ,
    xpressfu = xtra["xpressfu"]          ,  
    ios      = xtra["io_socket"].Server  
] = process.argv.slice(0xa) 

__setup__  :  
xapp   = xpress()
server = Server(xapp) 
socket =  new ios(server)   //  binding  
gateways=process.argv[2] || 4000  

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
static_vn       =  null 
trigger_update  =  false  

const __wtcp__ =  {  

    "#fstream"   :   file  => {
        let  location_path  =`tmp/${file.name}`
        
        if  (static_vn  != null  ) 
        {
            location_path  = `tmp/${static_vn}/${file.name}`  
            //log ("vn -> " , static_vn) 
        }
        
        writeFile( location_path  ,  file.data  , ( err , data) => { 
            if  (err ) throw err  
        }) 
        //writeFileSync( location_path, file.data )  
    
    } , 
    "@parser"   :   ( data  , sep ="." ) => {
        const  explode = data.split(sep) 
        return  required_file_extension.includes(explode[explode.length -1 ] )  
    },
    files_upload_processing   :   ( fu  , callback_handler  = false )   =>  {  
        let   gfiles =[]   
        if  ( typeof(fu) == "object"  &&   !fu.length     ) gfiles =  [[ ...gfiles ,    fu]]   
        if  ( typeof(fu) == "object"  &&   fu.length > 1  ) gfiles =  [[ ...gfiles , ...fu]]  
        const  file_len  =  gfiles[0].length 
        let  i =  0 
        gfiles[0]
        ["forEach"](   ( file   , index  ) => {
            if  (callback_handler)  callback_handler(file)
            i  = index +1 
        })
        return  file_len ==  i 
    },  
    
    wtcp_server  : () => {

        xapp
        ["get"] ("/" , ( rx , tx  )  =>    { 
            tx.setHeader("Content-type" ,  "text/html")  
            tx.render("index.ejs"  ,  { socket : true })  
        })
        ["post"] ("/",  ( rx  ,tx  ) => {  
            const { files_upload_processing  }  = __wtcp__ 
            if (!rx?.files ) log ("file upload module not found ")  
            let  { fupload  }  = rx.files
            fupload  = fupload.filter  ( file  => __wtcp__["@parser"](file.name))
            if  ( files_upload_processing (fupload  ,   __wtcp__["#fstream"]) ) 
            {
                trigger_update  = true   
                tx.redirect("/") 
            } 
            //! TODO : SEND   BAD  STATUS 
        }) 
        ["use"]((rx , tx  , next )   =>  tx.redirect("/"))

        server 
        ["listen"](gateways , "0.0.0.0" ,log(`\x1b[1;32m * connected on  ${gateways}\x1b[0m`))
        ["on"]("error" , err         => {  
            switch (err.errno)   
            {
                case  -98  :  //!EADDRINUSE  
                    log (`\x1b[1;33m -*this gatewaye ${gateways} is already used by  \x1b[4m ${process.argv[1]} \x1b[0m`) 
                    process.exit(err.errno) 
            }
        }) 

        socket.on("connection" , sock => { 
             __client_side_evt__  : 
             NAVIGATOR_FPRINT  :   sock.on("clifp"  , user_agent =>   log (user_agent))  
             
            //sock.disconnect()  

            VIRTUAL_NAMESPACE   :  sock.on("create::job" ,   async   namespace  =>  {
                namespace   =  namespace.replace(" " , "_")
                let job_stack  = await utils.list_allocated_job_space()
                log(job_stack)  
                job_stack      =  job_stack.map(dirent => dirent.name) 
                if  (  !job_stack.includes(namespace)  )  
                {
                    utils.access_userland ( namespace  , sock )
                    static_vn =  namespace 
                    absvpath  =`${__dirname}/tmp/${namespace}`  
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

                    sock.emit("jobusy" , namespace )  
                } 
            }) 
            
            FILE_VISUALIZER  :  sock.on("update::fileviewer" ,   async  virtual_namespace   => {
                log ("uf " ,   virtual_namespace) 
                let  files  =   await  utils.list_allocated_job_space(true ,  virtual_namespace )  
                files       = files.map(dirent=> dirent.name)  
                sock.emit("update::fileviewer" ,   files   )  
            })
            
             
            RUN_SUMMARY : sock.on("run::summary" ,  gobject   =>     { 
                let   { paths ,  selected_files  } = gobject  ,   
                      [pedfile,mapfile,phenfile]  = selected_files
                
                pedfile  =  `${paths}/${pedfile}`
                mapfile  =  `${paths}/${mapfile}`
                phenfile =  `${paths}/${phenfile}`
                log ("--> " ,  phenfile ) 
                utils.rsv_file(phenfile ,  '\t')
                .then(res => {
                    utils.std_ofstream(`Rscript ${summary_source} --pedfile ${pedfile} --mapfile ${mapfile} --phenfile ${phenfile}` ,
                        exit_code => {
                            if  (exit_code == 0x00)  
                            {   
                                utils._stdout(sock)  
                                sock.emit("load::phenotype"  ,  res-2)  
                                
                            }else{   
                                log("fail")   
                                utils._stderr(sock , exit_code) 
                            }  
                        })
                }) 
            })

            RUN_ANALYSYS :   sock.on("run::analysis" ,  gobject => { 
                const { paths  , selected_index  }  = gobject,
                     {  mm    , sm , ped , map , phen , phenotype_,  nbsim_ , nbcores_ , markerset }  = selected_index, 
                     [  pedfile , mapfile , phenfile  ] = [ `${paths}/${ped}` , `${paths}/${map}`,`${paths}/${phen}` ]  

                log ( pedfile , mapfile , phenfile ) 
                let cmdstr = null 
                if (mm && markerset!= null && markerset != '')  
                { 
                    cmdstr =`Rscript ${run_analyser} --pedfile ${pedfile} --mapfile ${mapfile} --phenfile ${phenfile} --phen ${phenotype_} --nbsim ${nbsim_} --nbcores ${nbcores_} --markerset ${markerset}` 
            
                } 
                if  (sm)  
                {
                cmdstr =`Rscript ${run_analyser} --pedfile ${pedfile} --mapfile ${mapfile} --phenfile ${phenfile} --phen ${phenotype_}  --nbcores ${nbcores_}`
                }

                utils.std_ofstream(cmdstr ,  exit_code  => {
                    if(exit_code ==0x00) 
                    {
                        log("exit" , exit_code )
                        sock.emit("end"  , exit_code) 
                        utils._stdout(sock)   
                    }else {
                        log("error") 
                        utils._stderr(sock)   
                    }
                })

            
            })

             __server_side_evt__  :  
             
             INIT              :  sock.emit("init" , "let's rock'n'roll")  
             SERVER_INFO       :  sock.emit("initialization" ,  utils["cpus_core"](true)) 
            
        })

    }
    
}

__wtcp__.wtcp_server() 
