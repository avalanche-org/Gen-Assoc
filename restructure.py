#!/usr/bin/python3 
"""
author  : Umar  <jUmarB@protonmail.com>  
normalize file  to  tab separator 
""" 

sys  = __import__("sys")
os   = __import__("os") 

pattern_sep = {" " , "," ,";" , ":"}

pattern_norm="\t"

assert  sys.argv[1]  is not None    

def  __restructure_file  (  file : str )  :
    fd = os.open ( file ,  os.O_RDONLY )
    assert  fd.__gt__(0) , "IO  Error"
    file_size_content  =  os.stat(file).st_size  
    contents =  os.read (fd , file_size_content)  
    
    detect_separten =  {  s for s in pattern_sep if contents.decode().__contains__(s) } 
    
    if  detect_separten & pattern_sep : 
        contents =  contents.decode().replace(" " ,  "\t")  
    
    os.close(fd)

    fdw = os.open (file , os.O_WRONLY | os.O_CREAT) 
    os.write(fdw , contents.encode()) 
    os.close(fdw) 




if __name__.__eq__("__main__") : 
    __restructure_file(sys.argv[1]) 
