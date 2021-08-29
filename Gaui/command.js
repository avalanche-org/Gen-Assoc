/*
 * author  : umar <Jukoo>  <github.com/jukoo> 
 */  


const  {  
    readdir  
} = require("fs")  

module.exports =   {  

    ["clear"]  : (...unused_argument)   =>    {
        return  { 
            data   : "" , 
            description: "clear the terminal"
        } 
    },  
    ["help"]   : (...cmd_name) =>   {
        let  cmd_helper_collects  =[]  
        if  (!cmd_name )  
        {  
            for (let key of  Object.keys(module.exports )  )  { 
                if   ( key != help) 
                {
                     cmd_helper_collects.push (`${key} :  ${module.exports.key().description}`)
                }
            }
            return cmd_helper_collects  
        } 
        return     {  data : module.exports[cmd_name[0]].description  , description : "show help  usage " }  
    },  
    
    ["ls"]  :   ( ...local_vworks  ) => {
        
        const  virtual_workspace =  local_vworks[0] 
        
    }
}  
