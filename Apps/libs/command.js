/*
 * author  : umar <Jukoo>  <github.com/jukoo> 
 */  


const  {  
    readdirSync  
} = require("fs") , 
    { log } = console,  
    { list_allocated_job_space } = require("./utils")  



module.exports =   {  

    ["clear"]  : (...unused_argument)   =>    {
        return  { 
            data   : "" , 
            description: "clear the terminal\n"
        } 
    },  
    ["help"]   :  (...cmd_name) =>   {
        let  cmd_helper_collects  =[`
        * mTDTerm  web version   v.1.0 Usage
        `]
        try  {  
            
            if  (!cmd_name[0].length)  
            { 
                log ( "no  cmd") 
                for (let key of  Object.keys(module.exports )  )  { 
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
    
    ["ls"]  :   ( ...local_vworks  ) => {
        
        const  virtual_workspace =  local_vworks[0]  ||  (void function ()  { return } ()) 
        let files_list =  null  
        if   ( virtual_workspace)  
        {
            let  files = readdirSync ( virtual_workspace ,  {withFileTypes : true } )  
            if ( !files  )  files_list  = "No such file(s)  in your workspace "
             else files_list             = files.map ( file => `${file.name} \n`)  
        }
        return   { 
            data :  files_list  ??  "No such file(s) in your workspace\n", 
            description  :  "list   all  files  on your  virtual workspace \n"
        }
       
    }
}  
