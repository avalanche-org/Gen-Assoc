#!/usr/bin/python3  

# FETCH  AND INSTALL  MISSING  R BINARY  PACKAGE 

from  enum  import Enum  , unique  
from  inspect  import  getmembers , isclass

os  = __import__("os")  
sys = __import__("sys") 
agp = __import__("argparse")  
sig = __import__("signal") 
m   = __import__("mmap") 
sbproc  = __import__("subprocess")  


@unique  
class DEFAULT_CONFIG  (Enum) :  
    RLIBPATH  : str  = "/usr/lib/R/library/" 
    DEFFNAME_REQ  : str = "dependenies.R" 
    



""" 
read  file  that containts a list of R package   by specifying flag  -f  
if the file is missing  build it from  host   /usr/lib/R/library   

"""  


class RpkManager  :  

    def __init__ (self )  :  
        self.dependencies_list  =  [] 
        self.cfmemb = []  
        self.cfval  = []  
        for k_config  , v_config  in  self.load_DC.items()  :  
            self.cfmemb.__iadd__([k_config])  
            self.cfval.__iadd__([v_config])  
            setattr(self, k_config, v_config)  


    @property  
    def load_DC  (self) : 
        """ 
        LOAD DEFAULT_CONFIG ... 
        """
        members ,  values  =  [ DEFAULT_CONFIG._member_names_ , list(DEFAULT_CONFIG._value2member_map_.keys()) ]  
        return dict (zip(members, values))  

    @property 
    def autoBuild (self)  :  
        """
        collection all library module and save  it in  file  
        
        """ 
        modules : list = os.listdir(self.RLIBPATH)
        dump_modobj =  os.open (self.DEFFNAME_REQ , os.O_CREAT|os.O_EXCL|os.O_WRONLY) 
        if   not  dump_modobj  :  
            sig.raise_signal(sig.SIGIO) 

        for module  in modules  :  
            module_name  :str = f"install.packages('{module}')\n"
            os.write ( dump_modobj ,module_name.encode() ) 
        os.close(dump_modobj)  
            
    
   
    def shell_exec  ( self , shell_command) : 
        blackhole  = os.devnull  
        childprocess =  sbproc.Popen( shell_command ,  stdout=sbproc.PIPE ,  shell=True)  
        return  childprocess.wait()  


    def scan_file (self)  :  
       requirementfile  = os.open(self.DEFFNAME_REQ , os.O_RDONLY) 
       assert requirementfile.__gt__(0)   
       
       with m.mmap(requirementfile , length=0  ,access=m.ACCESS_READ)  as mf  : 
           t =  mf.read().decode() 
           t = t.split(chr(0xa)) 
           self.dependencies_list.__iadd__(t) 

    def snapshot  ( self )   : ...  

    def fetch_from ( self ,  Rpkg_requirement_file )  : ...  
    
    @property 
    def install_dependencies  ( self) :  
        """ 
        read file  requirement  and install   each dependenci  
         
        """ 
        self.scan_file()  
        for rpkg  in self.dependencies_list : 
            sys.__stdout__.write(f"installing  { rpkg }  for R \n")  
            self.shell_exec(f"R CMD INSTALL {rpkg}") 
        
        



def build ()   : 
    Rlang  : RpkManager  = RpkManager()  
    print(Rlang.load_DC) 
    print(Rlang.RLIBPATH)
    print(Rlang.cfval ) 
     
    Rlang.autoBuild  
    #Rlang.install_dependencies 


if __name__.__eq__("__main__")   : 
    build() 
