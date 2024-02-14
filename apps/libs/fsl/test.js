const   fsl = require("./build/Release/fsl") 
const  {log} = console 

let  files = fsl.list_target_directory("/") ;  
let  f_node =  files.split("\n"); 
log(f_node)  

