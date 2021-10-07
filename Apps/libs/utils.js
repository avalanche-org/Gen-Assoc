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
        , open 
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
    "#get_user_log":  (virtual_directory ,  lgfile = false  )  =>  {
        let ulog  =  `.${virtual_directory.split("/").slice(-1)}.log`
        let ulog_abs_path  =`${virtual_directory}/${ulog}`
        if  (lgfile) return ulog ;  
        return  ulog_abs_path 
    } ,    
    "#user_log"   :   udir =>  { 
        open( module.exports["#get_user_log"](udir),   constants["O_CREAT"]  | constants["O_RDWR"],enouacc  =>  { 
            if (enouacc) 
            {
                socket.emit("fsinfo" , "Error :  cannot  build log  file  for you " ) 
                throw new Error(enouacc)  
            }
             
        }) 
    }, 
    make_new_userland   :  ( udir, socket  ) => {
        mkdir(udir , constants["S_IRWXU"] ,  enouacc =>  {  //! error no user access   
            if  (enouacc)
            {
                socket.emit ("fsinfo" ,  "ERROR : no privileges to create userlang access")  
                throw new Error( enouacc) 
            } 
            module.exports["#user_log"](udir)   
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
    
    std_ofstream   : (user_virtual_ws, command , socket  , callback )=> {
        const {  tail_logfiles  } =  module.exports  
        const user_logout =  module.exports["#get_user_log"](user_virtual_ws)  
        const cmd         =  exec(command)
        const wstdout     =  createWriteStream(user_logout) // ,  { flags : "a"}) 
        const stderr = createWriteStream(fstderr) 
        cmd.stdout.pipe(wstdout)
        cmd.stderr.pipe(stderr)   
        tail_logfiles( socket , user_logout , "stdout")  
        tail_logfiles( socket , fstderr , "stderr")  
        
        try  {  
            cmd.on("close" , exit_code =>  {
                callback(exit_code) 
                process.stdout.write(`exiting with code ${exit_code}\n`)
            })
        }catch (err) {  
            console.log(err) 
        } 
    } , 

    tail_logfiles :   (socket , logfile ,   where) => {
        const sksf = stream_key_socket_flags =   { //  skfs   as alias  
            "stdout"  :  [ "log::notfound"  , "log::fail" , "term::logout" ]  , 
            "stderr"  :  [  "log::notfound" , "log::broken" , "term::logerr"] 
        }
        if  (!Object.keys(sksf).includes(where))
            throw new Error(`no log file  name ${where} found `)  

        tailf  =  spawn ( "tail" , ["-f" ,  logfile ] )  
        tailf?.[where].on("data" ,  buffer_data => {
            try  { 
                socket.emit(sksf[where][2] , buffer_data.toString("utf-8")) 
            }catch ( error )  {  
                socket.emit(sksf[where][1] ,  stream_error) 
                process.exit(1) 
            }
        })
    }
 }
