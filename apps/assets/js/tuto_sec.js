//! tuto_sec.js   for m-TDT  
//! responsable  js  for tutorial 
//! copyright  (c)  2022,  Umar <jukoo> . [jUmarB@protonmail.com] (github/jukoo)   

import  {  log  , _  } from  "./ops.js"  

const  MTDTOOLROOT="/main" 

let link_references  =  [... _.querySelectorAll("a.ui")]
["filter"](link =>   link.hasAttribute("alt"))
["map"](link =>  {  

    link.addEventListener("click" ,evt =>  { 
        localStorage["cnav"]  = link.getAttribute("alt")
        location.href = MTDTOOLROOT 

    }) 

}) 



