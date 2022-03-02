/*
 * webpack.config.js :  mtdt  Gen-Assoc
 * Basic webpack configuration . 
 * copyright (c) 2022 , jUmarB@protonmail.com  Umar <jukoo>  
 */  
__kernel_file__ :  {  core = require("./kernel") }  
const  { resolve } =  core["@node_module"]["path"]  

const  [  
    source_app  =  "./assets/js/bridge.js",
    bundle_dir  =  "./assets/js/dist" 
] =  process.argv.slice(3)  

const  bundle_output_filename =   () =>  {  
    let   file_entry  = source_app.split("/")  
    file_entry =  file_entry[file_entry.length - 1 ]  
    return `build_${file_entry}` 
} 
    

module.exports  = {
    mode   : "development", 
    ["entry"] :   {  
        app   :  source_app 
    } , 

    ["output"]:{
        filename  : bundle_output_filename()  ,
        path      : resolve(__dirname , bundle_dir) 
    }, 
    
    ["devServer"]  : { 
        static     : { directory : __dirname }  , 
        compress   : true , 
        port       : process.env?.['PORT']  || 4000  

    }  
}
