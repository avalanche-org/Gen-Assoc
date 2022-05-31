/*
 * webpack.config.js :  mtdt  Gen-Assoc
 * Basic webpack configuration . 
 * copyright (c) 2022 , jUmarB@protonmail.com  Umar <jukoo>  
 */  
__kernel_file__ :  {  core = require("./kernel") }  
const  { resolve } =  core["@node_module"]["path"]  

const  [  
    source_app  =  "./assets/js/bridge.js", 
    tuto_sec    =  "./assets/js/tuto_sec.js", 
    bundle_dir  =  "./assets/js/dist" 
] =  process.argv.slice(4)  

const  bundle_output_filename = sourcefile_path  =>  {  
    let   file_entry  = sourcefile_path.split("/")  
    file_entry =  file_entry.at(-1)   
    return `build_${file_entry}` 
} 
    

module.exports  = {
    mode   : "development", 
    ["entry"] :   [ 
        source_app ,  
          tuto_sec 
    ], 

    ["output"]:{
        filename  : bundle_output_filename(source_app)  ,
        path      : resolve(__dirname , bundle_dir) 
    }, 
    
    ["devServer"]  : { 
        static     : { directory : __dirname }  , 
        compress   : true , 
        port       : process.env?.['PORT']  || 4000  

    }  
}
