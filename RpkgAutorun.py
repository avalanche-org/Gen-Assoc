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
    ACTIVE_NPTHREAD_CORE : int =  os.cpu_count()  
    RLIBPATH      : str  = "/usr/lib/R/library/" 
    DEFFNAME_REQ  : str  = "dependenies.R"
    RMODUMP       : str  = "Rallib.txt"
    


""" 
read  file  that containts a list of R package   by specifying flag  -f  
if the file is missing  build it from  host   /usr/lib/R/library  
--- 
DOCKER   

1 =>  GET THE LIST OF AVAILABLE PACKAGE  PRESENT ON DOCKER IMAGE  
2 =>  COMPARE THEM AND EXTRACTE THE MISSING  
3 =>  BUILD  <dependencies.R> file  
4 =>  install  all  

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
    def retrive_Rlibmodule  (self)  :  # for docker image  
        """  
        fetch  all R  libmodule present in the host   

        """
        return  os.listdir(self.RLIBPATH)  
    
    @property  
    def load_dumped_library ( self )  : 
        """
        load  Rallib.txt  that contains  required_modules  
        return  a collection of set   
         
        """ 
        return  set(self.io_read(self.RMODUMP))   


    @property  
    def missing_lib  (self) : 
        
        required_modules   =  self.load_dumped_library  
        rhost_present_modules  = set(self.retrive_Rlibmodule) 
        
        return  required_modules ^rhost_present_modules  
        

    @property
    def snapshot  ( self ) :  #write  mode  
        """
        Take  a snapshot  of your current  host R library  
        and write it into  Rallib.txt file 
        """
        
        modules =  self.retrive_Rlibmodule  
        try  : 
            dump_modobj =  os.open(self.RMODUMP ,  os.O_CREAT | os.O_EXCL | os.O_WRONLY)  
        except  FileExistsError : 
            #NOTE :  if  you  want to take new change  delete the Rallib.txt file  
            sys.__stdout__.write(f"{self.RMODUMP}  already exists\n remove file if  you want to take  new changes\n")
            return  

        assert  dump_modobj.__gt__(0) 
        
        for module in modules :  
            module_name : str = f"{module}{chr(0xa)}" 
            os.write(dump_modobj, module_name.encode()) 
        os.close(dump_modobj) 


    @property 
    def autoBuild (self)  :  #write  mode 
        """
        collection all library module and save  it in  file 
        """ 
        modules : list =  list(self.missing_lib)   
        if  modules.__len__().__eq__(0)  :  
            sys.__stdout__.write(f"no asymetric  dependencies found  [  all requiermens done ] \n") 
            sys.exit(0)  

        dump_modobj =  os.open (self.DEFFNAME_REQ , os.O_CREAT|os.O_EXCL|os.O_WRONLY) 
        if  dump_modobj.__eq__(0):   
            sig.raise_signal(sig.SIGIO) 

        for module  in modules  :  
            module_name  :str = f"install.packages('{module}')\n"
            os.write ( dump_modobj ,module_name.encode() ) 
        os.close(dump_modobj)  
            
    
   
    def shell_exec  ( self , shell_command) : 
        blackhole  = os.devnull  
        childprocess =  sbproc.Popen( shell_command ,  stdout=sbproc.PIPE ,  shell=True)  
        return  childprocess.wait()  

      
    def io_read(self , fileTarget)  : 
        assert  os.access(fileTarget , os.F_OK) ,  f"file not found" 

        list_of_required_module   = os.open(fileTarget  , os.O_RDONLY) 
        assert  list_of_required_module.__gt__(0)   

        with m.mmap(list_of_required_module , length=0  ,access=m.ACCESS_READ)  as modobj : 
            modules =  modobj.read().decode() 
            modules = modules.split(chr(0xa))
            return modules[:-1] 


    
    @property 
    def install_dependencies  ( self) :  
        """ 
        read file  requirement  and install   each dependenci  
         
        """
        ...

#NOTE : 
"""
1  ->  make snapshot  


--- 

FLAGS : 
     -s , --snapshot 
     -i , --install-dependencies
     
"""
def build ()   : 
    Rlang  : RpkManager  = RpkManager()  
    
     
    Rlang.autoBuild 
    #Rlang.install_dependencies 


if __name__.__eq__("__main__")   : 
    build() 
