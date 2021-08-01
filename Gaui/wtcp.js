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
    {summary_src  , run_analysis } = require("./config.json")["mtdt_pannel"], 
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


const __wtcp__ =  {  

    fstream   :   file  => {
        const location_path  =`tmp/${file.name}` 
        writeFileSync( location_path, file.data )  
    
    } ,  
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
        if ( file_len == i  ) 
        { 
           log ( "done ")  
        } 
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
            const  { fupload  }  = rx.files 
            files_upload_processing (  fupload  ,  __wtcp__.fstream) 
            tx.redirect("/") 
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

             LOAD_DEFAULT_STATIC_FILES  :  sock.on("load::fstatic" , d =>  {
                 const {scan_directory } = utils 
                 scan_directory( __dirname ,  "ped" ,"map","phen" ) 
                 ["then"]( res =>{  
                     sock.emit("Browse::single" , { main_root : __dirname ,  files :  res})
                 })   
             })
             
            RUN_SUMMARY : sock.on("run::summary" ,  gobject   =>     { 
                let   { paths ,  selected_files  } = gobject  ,   
                      [pedfile,mapfile,phenfile]  = selected_files
                if(typeof(paths) ==  "object"  && paths.length == 0x03 )  
                { 
                    pedfile  =  `/${paths[0]}/${pedfile}`
                    mapfile  =  `/${paths[1]}/${mapfile}`
                    phenfile =  `/${paths[2]}/${phenfile}`
                }else  {
                    pedfile  =  `/${paths}/${pedfile}`
                    mapfile  =  `/${paths}/${mapfile}`
                    phenfile =  `/${paths}/${phenfile}`
                }  
                utils.rsv_file(phenfile ,  '\t')
                .then(res => {
                    utils.std_ofstream(`Rscript ${summary_source} --pedfile ${pedfile} --mapfile ${mapfile} --phenfile ${phenfile}` ,
                        exit_code => {
                            if  (exit_code == 0x00)  {
                                readFile(".logout" , "utf8" ,  (e , d ) => {
                                if (e)  sock.emit("log::fail" , e  )   
                                sock.emit("term::logout"  , d )   
                            })
                                sock.emit("load::phenotype"  ,  res-2)   
                            }else {
                                log("fail")  
                                access(".logerr" , constants["F_OK"] , error => {
                                    log (error) 
                                    if (error ) sock.emit("logerr::notfound" , error)  
                                    readFile('.logerr' , "utf8" , (err , data) =>{
                                        if(err) sock.emit("log::broken" ,  error ) 
                                        log(data)
                                        sock.emit("term::logerr" , data) 
                                    })
                                }) 
                            }
                        })
                }) 
            })


             __server_side_evt__  :  
             
             INIT              :  sock.emit("init" , "let's rock'n'roll")  
             SERVER_INFO       :  sock.emit("initialization" ,  utils["cpus_core"](true)) 
            
        })

    }
    
}

__wtcp__.wtcp_server() 
