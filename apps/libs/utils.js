#!/usr/bin/env node 
/** 
 * utils  module  
 * @module libs/utils.js   for  Gen_Assoc/m-TDT 
 * copyright (c)  2022 , Umar  jUmarB@protonmail.com  <github.com/jukoo>
 */  
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
        , open 
        , stat
        , stats
        , copyFile 
        , cp , symlink 
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
        virtual_workstation ,  
        sandbox  
    }   =  require ("./../config")["web_server"] , 
    { 
        mtdt ,ginoInference, __MACOSX,libs,mendelTable   
    }   = require ("./../config")["mtdt_essential"] , 
    path=  require("path") 


//! Hold the running  subprocess  :  run_analysys  and run_summary 
let subprocess =  ( void function()  {return}()) 

//! handle  Buffer between  userlog file  and  the built-in terminal to  avoid  double  rendering 
let buffer_sandbox =  ( void function () { return}())  

   
module
["exports"]  =  {

    /** 
     * Parse  file  like csv  or tsv  
     * @param {  string }  file -  target file  
     * @param {  string }  default_delimiter  -  by default  is ','  like csv  file   
     * @param {  bool   }  readable_mode      -  show the content of the file  by default it's desabled  
     * @return { promise}  promise  
     */   
    rsv_file :  (  file  , default_delimiter = ","  , readable_mode  = false  )  => {
        return new Promise  ( (resolve , reject )  => { 
          //let  reformat =  module.exports.restructure(auto_restructure , file)   
            readFile(file ,  "utf8" , (e , file_data ) => {
              if (readable_mode ) {
                  resolve(file_data) 
              } 

              if (e) { 
                reject(e) 
              }
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

    /**
     * reconstitute  relative  path to absolute  path   by  repalacing '<>'  present if  config file  
     * @param  { string } data   - absolute path  <path.join(__dirname  , [step] ) 
     * @param  { string } object - relative  path  decribe to  config file   <>/relative/path
     * @param  { string } default_symbol  -  marker  that help  to make replace operation  
     * @return { string } absolute path  
     */
    auto_insject  : ( data   , object ,  default_symbol  = "<>" )  => {
        if (object.includes(default_symbol) ) 
            return   object.replace(default_symbol , data ) 
        
    },  
    
    /**
     * retrive information  from the host   how many cpus core are available  
     * @param  { bool }  os_abstract  -  if true retrive  more info  
     * @return { object  |  int  }    depend on os_abstract  stat 
     * 
     * @TODO:  make equivalent using Addon 
     */   
    cpus_core  : (os_abstract = false  )   =>  {  
        if (os_abstract)    
        {  
            return   {
                "cpus"      :  os.cpus().length, 
                //!TODO :  catch  jobs name 
               // "username"  :  os.userInfo().username, 
                "shellType" :  "m-tdterm"  //os.userInfo().shell 
            }
        } 
       return  os.cpus().length  
    },  

     
    /**
     *  get  full path of user  logs files 
     *  @param  { string } virtual_directory  - where  job space are located  
     *  @param  { bool   }  lgfile  - if  true only logfiles 's name are returned otherwise the full path  of logs 
     *  @return { array  }  stdout and stderr 
     */
    "#get_user_log":  (virtual_directory ,  lgfile = false  )  =>  {
        let ulog  =  `.${virtual_directory.split("/").at(-1)}.log`
        let uerrlog  =  ulog.replace("log", "err")  
        let ulog_abs_path  =`${virtual_directory}/${ulog}`
        let errlog_abs_path=`${virtual_directory}/${uerrlog}`
        if  (lgfile)
        {
           return   [  ulog ,  uerrlog ]   
        }
        return  [ulog_abs_path ,errlog_abs_path ] 
    } ,    

    /**
     * build  user logs  
     * @param  { string }  udir -  where job  space  are located  
     */
    "#user_log"   :   udir =>  { 
        module.exports["#get_user_log"](udir).forEach (  log => {   

            open( log, constants["O_CREAT"]  | constants["O_RDWR"],enouacc  =>  { 
                if (enouacc) 
                {
                    socket.emit("fsinfo" , "Error :  cannot  build log  file  for you " ) 
                    throw new Error(enouacc)  
                }
            })
        }) 
    },

    /**
     * Dump essential  scripts to  job space  
     */

    dump_essentialScripts  :  job_namespace  =>  {
        log(job_namespace) 
        const   { auto_insject }  = module.exports  
        let  runtime_requiered_script =  [ mtdt , ginoInference , __MACOSX ,libs,mendelTable] 
        
        runtime_requiered_script= runtime_requiered_script.map( essentialfile =>  {  
          
            let  datatype  =  auto_insject(path.join(__dirname ,"../.."), essentialfile)
      
            stat(datatype  , (err , stats )=>  { 
                
                let  basename =  datatype.split("/") 
                basename=basename.at(-1) 
                if  ( stats.isDirectory()) 
                {
                    
                    symlink(`${datatype}/`, `${job_namespace}/${basename}`,(err , data)  => { 
                        if(err) throw  err    
                    })  
                }
                if  (stats.isFile()) 
                {
                    copyFile(datatype ,`${job_namespace}/${basename}` ,  err=> { 
                        if (err) log(err)  
                    }) 

                }
            })
        

        }) 


    }, 

    /**
     * build virtual_userspace or   virtual_directory  
     * @param  {string} udir  - where   the job space are located 
     * @param  {socket} socket - socket channel   to emit  event  
     */
    make_new_userland   :  ( udir, socket  ) => {
        mkdir(udir , constants["S_IRWXU"] ,  enouacc =>  {  //! error no user access   
            if  (enouacc)
            {
                socket.emit ("fsinfo" ,  "ERROR : no privileges to create userlang access")  
                throw new Error( enouacc) 
            } 
            module.exports["#user_log"](udir)  
            module.exports.dump_essentialScripts(udir)   
            let  jobspace_basename  =  udir.split("/").at(-1)  
            socket.emit ("fsinfo" ,    `Creating Job Space : ${jobspace_basename}`) 
            
            socket.emit("ok" ,   200  ) 
           
            socket.emit ("trunc::baseroot" ,  udir ) 
        
        })
    },

    /**
     * build automaticly  the virtual tempory directory 
     * that store  all jobs each  job  is an isolated  directory called virtual directory  
     * @param  {string}  abs_tmp_dir_path  -  absolute path  where the vtmp  will be created  
     */
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

    download_manager   :  ([ ...multiple_path_register ] ) => { 

        log ("dm  entry " ,multiple_path_register) 
        return  new Promise( ( resolve ,reject )  => { 
            
            multiple_path_register.map (dfile  =>  { 
                access(dfile ,  constants["F_OK"] , err_lookup_fail => {  
                    if  (!err_lookup_fail) resolve(dfile) 
                }) 
            } )
        }) 
    } , 

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
        
        const  job_name  =  current_dir_job.split("/").at(-1)  
        rm(  current_dir_job ,  { recursive  : true } , error =>  {  
            if (error) throw error  
        }) 
        //! check   compressed assets in sandbox  
        let  sandbox_path  =  module.exports.auto_insject(path.join(__dirname  , '..')  , sandbox)  
        let  compressed_assets_location  =  `${sandbox_path}/${job_name}.zip`  
        access ( compressed_assets_location   , constants.F_OK  , err => { 
            if  (err) 
            {
                return (void function ()   { return } () )   
            }
            rm (compressed_assets_location  , err =>   {  
                if (err) 
                {
                    log ( `cannot remove ${compressed_assets_location} `) 
                    throw  err  
                }
            })
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
    restructure  : ( script_source  , file  ) =>  { 
        access (script_source  ,  constants["F_OK"]  ,  err  =>  err ?? err  )  
        
        let interpreter = `python  ${script_source} ${file}` 
        
        return exec(interpreter)  
         
        
    } , 
    scripts  :  ( script_source   ,   { ...arguments }  )  =>  { 

        access (script_source  ,  constants["F_OK"]  ,  err  =>  err ?? err  ) 
        const allowed_keys_args  =   [ 
            "pedfile" , "mapfile" ,  "phenfile" , "phen", 
            "nbcores","nbsim", "markerset", "gi","jobtitle" ,"cores" ,"genoinference"
        ]  
        const  kwargs = Object.keys(arguments)  
        
        kwargs.forEach ( k =>  { 
            if ( !allowed_keys_args.includes(k)) throw new Error ("undefined  key words") 
        }) 
      let interpreter = `Rscript ${script_source} ` 

        for  ( let kw  in arguments)  
             interpreter+=` --${kw}  ${arguments[kw]}` 
       
      log("command interpreter -> " , interpreter) 
        return  interpreter     
        
    }, 
    
    dispatcher :  buffer  =>  { 
        return  new Promise(( res , rej )  => { 
            readFile(buffer   ,  (err_open  , fd ) => { 
                if (err_open) 
                {
                    switch (err_open.code)  
                    {
                        case 'EISDIR' : 
                            res(` -x ${buffer}/* `)
                            break 
                    }
                }
                res(` -x ${buffer} `)  
            })
        }) 
    },  
    compress  :    async  (  payload_data   ,  compression_algorithm =  "zip")   =>  { 
        const [ chanel , virtual_userspace ]  = payload_data 
        if  (virtual_userspace.length  == 0  ) 
        {
            return  null 
        }

        
        let sandbox_path  =  module.exports.auto_insject(path.join(__dirname  , '..')  , sandbox)  
        const udir  =  virtual_userspace.split("/").splice(-2).join("/")  
        
        let  xtarget  =  [ mendelTable , mtdt, ginoInference  ,  libs ,__MACOSX  ].map( async x_file  => {  
            let  fd_target  = `${udir}/${x_file.split("/").at(-1)}` 

            return await module.exports.dispatcher(fd_target)  
        })   
        xtarget  = await  Promise.all([...xtarget])  
        
        const compress_name  = virtual_userspace.split("/").at(-1) +`.${compression_algorithm}` 
        sandbox_path+=  `/${compress_name}`
        let fullpathcomp  = sandbox_path   
        sandbox_path =  sandbox_path.split("/").splice(-3).join("/")  

        let cmd  = `${compression_algorithm}   -r ${sandbox_path}  ${udir}  ${xtarget.join("")} ` 
        exec(cmd  , ( exec_err , exec_stdout , exec_stderr ) =>  { 
            if (!exec_err)  
            {
                chanel.emit("fsinfo" ,  `+ Compressed as  ::  ${compress_name}`) 
                return   
            }

            chanel.emit("fsinfo" ,  `x Compression  Problem  ::  ${compress_name}`)

        }) 
         
        /*
         * TODO  :  fix securty  issue  ... for exec  call  
         *
        let xtra_flags = `${udir} ${xtarget.join("")}` 
        let argopt  = ['-r' , sandbox_path ]  
        for ( let xflags  of  xtarget ) 
            argopt.push(xflags)  


        const subprocess =  spawn(compression_algorithm  , argopt,  { 
            detached :true , stdio : 'ignore'
        }) 
        subprocess.unref() 
        subprocess.ref() 
        subprocess.on("exit" ,  exit_code =>  { 
            if  (exit_code == 0  ) 
            {
                chanel.emit("fsinfo" ,  `+ Compressed as  ::  ${compress_name}`)
                return  
            }
            chanel.emit("fsinfo" ,  `x Compression  Problem  ::  ${compress_name}`)
        }) 
        */
        return  fullpathcomp
       
    } , 


     /* kill  the running subprocess  */ 
     kill_subprocess: socket_channel   =>  {
         if (subprocess?.kill && subprocess?.pid) 
         {  
             process.stdout.write(`trying  to kill  pid :   ${subprocess.pid} \n`)  
             subprocess.kill("SIGKILL") 
         
            
             if  ( !subprocess.killed) 
             {
                const  ekillmsg = `Fail to  kill running  process ` 
                process.stderr.write(ekillmsg) 
                return  
             }  
             //!  SIGKILL BRUTE  FORCE  
             let sb_bruteforcekill  = spawn("kill" ,  [ '-9' ,  subprocess.pid ] ,   {   
                 detached  : true  , stdio:'ignore'  
             })  
             sb_bruteforcekill.on("exit" ,  successfully_killed   =>   { 
                 if  (successfully_killed ==  0 )  
                     socket_channel.emit("fsinfo" , "killed")
                 else  
                     log("fail to  kill running process")  
             }) 
         }  
         
    } , 
    mtdt_failure   : ( socket , bad_code_exit   , show_on_console=false )   =>  {
        //!  usefull  for debugging  ... 
        if  (show_on_console)  
        {  
            process.stdout.write(`mtdt failure  :  ${bad_code_exit}`) 
        }
        socket.emit ( "mtdt::failure" ,bad_code_exit)   

    }, 
    std_ofstream   : (user_virtual_ws, command , socket  , callback )=> {
        const {  tail_logfiles   ,    kill_subprocess } =  module.exports  
        
        const [ustdout_log , ustderr_log  ]    =  module.exports["#get_user_log"](user_virtual_ws)  
        subprocess  =  exec(command) 

        const wstdout     =  createWriteStream(ustdout_log)   
        const wstderr     =  createWriteStream(ustderr_log) 
        subprocess.stdout.pipe(wstdout)
        subprocess.stderr.pipe(wstderr)
        tail_logfiles( socket ,  wstdout , "stdout")  
        tail_logfiles( socket ,  wstderr , "stderr") 

        try  {  
            subprocess.on("close" , ( exit_code ,   signal  )  =>  { 
                let  execute_status  =  exit_code  != 0  ? `\nFAILLURE : ${exit_code || signal }\n` : "\nSUCCESS : [ ok ]\n"
                setTimeout(() =>  {  
                    if  ( process.env?.LG_CLOSE)   
                    {
                        callback(exit_code)  
                        delete  process.env.LG_CLOSE 
                        socket.emit("term::logout" ,  execute_status)  
                    }else  
                        callback(execute_status)   

                }  , 500)  
                
            })
        }catch (err) {  
            process.stderr.write(err)  
            socket.emit("log::fail" , err) 
            
        } 
    } ,
    
    flush_sandbox_buffer  :   tailout_data  =>  {   

        if  ( tailout_data  !=  buffer_sandbox  )   
        {
            setTimeout( () =>  {  
            log ("buffer  sandbox " ,  buffer_sandbox) 
            log ("catched data "    ,  tailout_data)  
            } , 200) 

            buffer_sandbox  =  tailout_data   
            return  buffer_sandbox  
        } 

        buffer_sandbox = "" 
        return buffer_sandbox 

    } ,  
    tail_logfiles :   (socket , logfile ,   where) => {
        const sksf = stream_key_socket_flags =   { 
            "stdout"  :  [ "log::notfound"  , "log::fail" , "term::logout" ]  , 
            "stderr"  :  [  "log::notfound" , "log::broken" , "term::logerr"] 
        }
        if  (!Object.keys(sksf).includes(where))
            throw new Error(`no log file  name ${where} found `)  

      const  LG_FILE = logfile.path

      log (" log file ->" ,  LG_FILE)
        logfile.on("close" ,  _  =>  { 
          //! start streaming file 
            if  (LG_FILE.endsWith('log')){ 
            module.exports.stream_log(LG_FILE , socket,sksf[where][2]) ;  
          } 
          if ( LG_FILE.endsWith("err") ) {
            module.exports.stream_log(LG_FILE , socket,sksf[where][2]) ;  
          }
        })
     
    },

  /**
   *
   */ 
  stream_log :  (target_logfile, socket, where) => {  

    const  stream_tail  = createReadStream(target_logfile ,  { encoding :"utf-8"}) 
    stream_tail
    ["on"]('data' , logbuffer => { 
      try { 
        log("XXXXXXX " , logbuffer) 
        socket.emit(where ,  logbuffer) ; 
      }catch(readstream_error) {
        socket.emit(where ,  readstream_error);  
        process.exit(~0) ; 
      }
    }) 

    stream_tail
    ["on"]("close" , _=>   process.env.LG_CLOSE = true)  ; 
  }
 }
