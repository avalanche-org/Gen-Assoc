/*
 * author  : Umar <Jukoo>  <github.com/jukoo>
 * filename:  command.js  
 * description : simulate  unix  command line on  Mtdt web  service  
 */  


const  {  
    readdirSync,  
    readFileSync , 
    constants
} = require("fs") , 
    { log } = console,  
    { list_allocated_job_space } = require("./utils"), 
    http = require("http") 


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
/** @module libs/command **/  
module.exports =   {  
    /**
     * clear  the console 
     * @params  { Array }  
     * @return  { Object} 
     */  
    ["clear"]  : (...unused_argument)   =>    {
        return  { 
            data   : " ", 
            description: "clear the terminal\n"
        } 
    },  
    /**
     * display all command or  single command to get usage  
     * @param  {  Array  }   
     * @return {  Object } command name :  description  
     */ 
    ["help"]   :  (...cmd_name) =>   {
        let  cmd_helper_collects  = [ mtdtart ]
        try  {  
            if  (!cmd_name[0].length)  
            { 
                log ( "no  cmd") 
                for (let key of  Object.keys(module.exports)  )  { 
                    if   ( key != "help")
                    {
                         cmd_helper_collects.push(`\r${key}\t:\t${module.exports[key]().description}`)
                    }
                }
                return    { data :  cmd_helper_collects }    
            }
         
            return  {  data : module.exports[cmd_name[0]]().description }  
        }catch  (e)  { }  
    },  
    /**
     * list  all  files  in virtual user space  including   dot  files logs 
     * @param    {Array} 
     * @return   {Object}  files liste  and  description of the command  [ not used ] 
     */ 
    ["ls"]  :   ( ...local_vworks ) => {
        const  virtual_workspace =  local_vworks[0]  ||  (void function ()  { return } ()) 
        let files_list =  "No such  file(s) in your workspace\n"  

        if   (virtual_workspace)  
        {
            let  files = readdirSync ( virtual_workspace ,  {withFileTypes : true } )
            if  (files.length) files_list= files.map ( file => `${file.name} \n`)  
        } 
        return   { 
            data :  files_list,
            description  :  "list   all  files  on your  virtual workspace \n"
        }
    } ,
    /**
     * print  file inside  console  
     * @param  { Array }  
     * @return { Object}  file contents    and  description 
     */
    ["cat"]  :( ...filetarget) => {  
      
        filetarget =  filetarget[0]  ||  (void function () { return } () )   
        if  ( filetarget   && filetarget.length   > 1 )  
        {
            const  path  = filetarget.join("/")  
            const [ ,filename ]  =  [ ...filetarget] 
            try  { 
                file_content =  readFileSync(path, "utf-8")  
                filetarget =  file_content +"\n" 
            }catch  ( Err )  {
                log(Err) 
                filetarget  = `${filename}  not found\n` 
            }
        } 
        else   filetarget = null  
        return  { 
            data  :   filetarget || ( void function ()  { return  } () ) , 
            description : "show  file contents\n"
        }
    }, 
    /**
     * display the  version of the Apps
     * @params   {  Array  }  
     * @return   {  Object }  
     */ 
    ["version"]  : ( ...no_Args) => {
        
        const  version = require("./../package.json")?.version 
        return { 
            data : version +"\n", 
            description  : "show version number  of application\n"
        } 
    },
    /**
     * tell  about  the  Apps  
     * @params {Array}  
     * @return {Object}  
     */
    ["about"] :  (...unused_argument ) =>  {  
     
       const static_path  ="extra/about.txt"
       let  file_content = null  
       try {  

           file_content = readFileSync(  static_path , "utf-8")
           file_content +="\n" 
        }catch   (Error) {  
            file_content = `Error : ${Error.name } -> ${Error.code}`
        }
        return  { 
            data  :  file_content || ( void function () { return } () )  , 
            description : "tell about m-TDT\n"
        }
    },
    /**
     * credits ...
     * @params  { Array } 
     * @return  {Object } 
     */ 
    ["credits"] :  (  ...unused_argument ) => {  
        return  {
            data : ( void function () { return } () ) , 
            description : "print  all support  behing  m-TDT\n"
        }
    },

    ["file"] :  ( ...filetarget) => {

        return  { 
            data  :  ( void function () { return } ()) , 
            description : "show metadata files \n"
        }
    } , 
    /**
     * Download file  via console 
     * @param  { Array } 
     * @return {Object } 
     */  
    ["get"]  : (...filetarget )  => { 
        file  = (  void function () { return } ()) 
        if  (filetarget[0]) 
            [ ,file]  =  filetarget[0]
     
        return  {  
            data  : `GET ${file}` || (void function () { return } () ) , 
            description :  "Download files\n"
        } 
    } 
}  
