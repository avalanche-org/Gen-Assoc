#!/usr/bin/env node 
//author  : Umar aka jukoo  j_umar@outlook.com   <github.com/jukoo>

const   
    { 
        readFileSync 
        , rm 
        , readFile 
        , createWriteStream 
        , readdir 
        , access 
        , constants  
        , createReadStream 
        , mkdir
    }   = require("fs") , 
    
    os =  require("os") ,  
    {
        execSync
        , exec 
        , spawn
    }   = require("child_process"), 
    
    {fromCharCode}            = String , 
    {log}                     = console,  
    
    { 
        fstdout 
        , fstderr 
        , fserror
    }   = require("./../config")["io_fstream"] , 
    {  
        virtual_workstation
    }   =  require ("./../config")["web_server"] , 
    path=  require("path") 

 
   
module
["exports"]  =  {
    //! TODO  : improve this function to manage correctly  csv or tsv  file ... 
    rsv_file :  (  file  , default_delimiter = ","  , readable_mode  = false  )  => {
        return new Promise  ( (resolve , reject )  => {
            readFile(file ,  "utf8" , (e , file_data ) => {
                if (readable_mode ) 
                    resolve(file_data) 

                if (e) reject(e.code)
                const headers = []  
                const endcc   =  fromCharCode(0xa) 
                for ( head  of  file_data.split(default_delimiter))  {
                     if (head.includes(endcc))  {
                        let last_head =  head.split(endcc)[0] 
                        headers.push(last_head) 
                        break 
                    }
                    headers.push(head)
                }

                resolve(headers.length)  
            })  
        
        }) 
      },  
      rendering_process  :   () =>  {
          /* *
           *  trying to adapt  index  file  for desktop  env application  
           * */ 
          let content  = readFileSync("index.ejs"  , "utf-8" )
          re   = /<% *.+%>/g
          let modified_content = content.replace(re  , "")   
          log(modified_content) 

    }, 
    auto_insject  : ( data   , object ,  default_symbol  = "<>" )  => {
        if (object.includes(default_symbol) ) 
            return   object.replace(default_symbol , data ) 
        
    },  
    cpus_core  : (os_abstract = false  )   =>  {  
        if (os_abstract)    
        {  
            return   {
                
                "version" :  os.version() , 
                "release" :  os.release() ,
                "type"    :  os.type() , 
                "arch"    :  os.arch() , 
                "cpus"    :  os.cpus().length, 
                //"cpusInfo":  os.cpus().map(cpu =>  cpu.model), 
                "username":  os.userInfo().username, 
                "plvl"    :  os.userInfo().uid, // plvl as permission level  
                "shellType": os.userInfo().shell 
                
            }
        } 
       return  os.cpus().length 
    },  
    output_stream  :  (where ,  socket )   => {    
        const sksf = stream_key_socket_flags =   { //  skfs   as alias  
            ".logout"  :  [ "log::notfound"  , "log::fail" , "term::logout" ]  , 
            ".logerr"  :  [  "log::notfound" , "log::broken" , "term::logerr"] 
        }  
        if ( !Object.keys(sksf).includes(where)  ) 
        {
            process.stderr.write (`stream file descriptor  is not definde\n`) 
            process.exit(1) 
        }
        
        access(where,  constants.F_OK,  stream_error  =>  { 
             if  (  stream_error  ) socket.emit(skfs[where][0]  , stream_error )  
             readFile ( where , "utf-8" ,  ( stream_error , buffer_data  )  => {
                 if ( stream_error )  socket.emit (skfs[where][1] , stream_error ) 
                 try { 
                    log(sksf[where][2])
                     log(buffer_data) 
                  socket.emit(sksf[where][2] ,  buffer_data ) 
                 }catch ( error )  { log (error)  }  
             })
        })  
    }  ,
    _stdout :  socket   => { 
        const  {  output_stream }  = module.exports 
        output_stream(".logout" , socket )  
    }, 
    _stderr :  (socket  , exit_code = false ) => {
        const  {  output_stream }  = module.exports 
        output_stream(".logerr" , socket)  
        if  ( exit_code ) 
        { 
            const  mesg_fail = `execution fail  : ${exit_code}` 
            socket.emit("term::logerr" , mesg_fail)  
        }
    } , 
    make_new_userland   :  ( udir, socket  ) => {
        mkdir(udir , constants["S_IRWXU"] ,  enouacc =>  {  //! error no user access   
            if  (enouacc)
            {
                socket.emit ("fsinfo" ,  "ERROR : no privileges to create userlang access")  
                throw new Error( enouacc) 
            } 
            socket.emit ("fsinfo" ,    `your  virtual repertory  is ready`)
            socket.emit("ok" ,   200  ) 
           
            socket.emit ("trunc::baseroot" ,  udir ) 
        
        })
    },
     
    _auto_build_tmp_dir  :    abs_tmp_dir_path  =>  {
        access ( abs_tmp_dir_path ,  enoacc =>  {  
            if (enoacc) 
            {   
                mkdir ( abs_tmp_dir_path ,  emake =>  { 
                    process.stdout.write("Setting  up  virtual workspace \n")
                    if (emake)  throw emake 
                })
            }
        })
    },

    access_userland   :  ( vworks , userland  ,  socket )  => { 
        const   { make_new_userland }  = module.exports 
        const udir        = `${vworks}/${userland}`
        readdir(vworks,   { withFileTypes : true} ,  ( enoreadd  , dir_contents ) => {
            if  ( enoreadd )  throw enoreadd  
            const  catched_dir_only=  dir_contents.filter( item => {  
                log (item) 
                item["isDirectory"]()
                
            }) 
            if  ( catched_dir_only.includes(userland))
            {
                socket.emit ("trunc::baseroot" ,  udir ) 
            }else{ 
                     make_new_userland(udir ,  socket)  
                     socket.emit("fsinfo" ,  "status :: ready  ") 
            } 
            
        })

    }  , 
    
    list_allocated_job_space   :  ( fonly = false)=>   {
       const  {  auto_insject}  = module.exports  
       const  tmp_dir  =  auto_insject(path.join(__dirname , "..") , virtual_workstation)
       return  new Promise ( ( resolve ,  reject  ) =>  {
           readdir ( tmp_dir   , {withFileTypes  : true } , ( error ,  dirent  ) => { 
               if  (error )  reject (error )
               if  (fonly) resolve ( dirent.filter ( dirent => dirent["isFile"]()))  
                resolve ( dirent.filter ( dirent => dirent["isDirectory"]()))  
           }) 
       })
           
    },   
    
    unset_job_space  :  current_dir_job  =>  {
        rm(  current_dir_job ,  { recursive  : true } , error =>  {  
            if (error) throw error  
        })
    },
    
    scan_directory  : (  dir_root_location , ...filter_extension  )  =>  {
       return   new Promise ( ( resolve , reject ) => {
           readdir ( dir_root_location , (err ,  dir_contents)=> {
               if  (err)  reject(err)    
               const files =  []  
               if  (filter_extension  &&  dir_contents) {
                   dir_contents.forEach( file  => {
                       let spread_filename  = file.split(".") 
                       let file_extention   = spread_filename[spread_filename.length -1 ]
                       if  (filter_extension.includes(file_extention) ) files.push(file)
                   }) 
                    
               }
               resolve(files.length ?  files : dir_contents) 
           })
       })
    },
    execmd  : (main_cmd  ,  ...options)=> {
        const  output_ =  spawn(main_cmd , options) 
        log(...options)
        console.log(`${main_cmd}` , ...options)
        return  new Promise( (resolve ,  reject)   => {
            output_.stdout.on("data"  ,  data      =>  { 
                log (data.toString()) 
                resolve(data.toString())
            }) 
            output_.stderr.on("data"  ,  e_data    => reject(e_data.toString()))
            output_.on("error"        ,  err       => reject(err.message))  
            output_.on("close"        ,  exit_code =>  console.log(`exited with ${exit_code}`)) 
        }) 
      }, 
    execmd_ :  command => {
       const  buffer  =  execSync(command)  
       return buffer.toString()  
    }, 
    
    std_ofstream   : (command ,  callback )=> {
        const   cmd    = exec(command)
        const stdout = createWriteStream(fstdout ) // ,  { flags : "a"}) 
        const stderr = createWriteStream(fstderr) 
        cmd.stdout.pipe(stdout)  
        cmd.stderr.pipe(stderr)   
        try  {  
            cmd.on("close" , exit_code =>  {
                callback(exit_code) 
                process.stdout.write(`exiting with code ${exit_code}\n`)
            })
        }catch (err) {  
            console.log(err) 
        } 
    } ,  
    Rlog :  ( logfile ,  mw_ ) => {  // Rlog  aka   realtime readable log 
         access( logfile  , constants["F_OK"] , error => {   
             if  (error) log("Unable  to access file or permission denied!") 
             if  (!error) log("ok  streaming  out -> "  ,logfile)  
         })
        const  plug  =  createReadStream(logfile)
        plug.on("data"  , data  => {
             mw_?.webContents?.send("plug"  , data )  
        }) 
    }
    
}
