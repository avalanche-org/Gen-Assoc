/**!  web Tcp  server  socket   
 *    for  synchronous exchange    
 *    ----
 *    author  :   Umar aka < jukoo >  @  github.com/jukoo  
 */ 

__kernel_file__          : { core  = require("./kernel")  }  
__kernel_file_props__    : { 
        nm    = core["@node_module"] ,
        cfg   = core["@config"]      ,
        xtra  = core["@extra"]       
} 

const  [
    { log }  = console                   , 
    {Server} = require("http")           ,
    {createReadStream} =nm["fs"]         , 
    xpress   = xtra["xpress"]            , 
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

const __wtcp__ =  {  

    wtcp_server  : () => {

        xapp
        ["get"] ("/" , ( rx , tx  )  =>    { 
            tx.setHeader("Content-type" ,  "text/html")  
            tx.render("index.ejs"  ,  { socket : true })  
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
                
             __server_side_evt__  :  
             INIT              :  sock.emit("init" , "let's rock'n'roll")  
            
        })

    }
    
}

__wtcp__.wtcp_server() 
