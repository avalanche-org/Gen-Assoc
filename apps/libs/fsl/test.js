const   fsl = require("./build/Release/fsl") 
const  {log} = console 

let  files = fsl.list_target_directory("/home/umar") ;  
log(files);
//let  f_node =  files.split("\n"); 
//log(f_node)  

