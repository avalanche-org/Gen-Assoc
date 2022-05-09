#!/usr/bin/python3  
# RpkgAutorun.py  for  m-TDT  
# Install  requires library  that R  needed in runtime  
# ---- 
# The first Time you run the m-tdt  application  
# that's install all  require lib  in background  Process
# and the end user wait  to have back the result  but that 
# take much time ...  
# The IDEA is to take  a snapshot  of my current host that 
# already have all need module  and make a snapshot 
# and this snapshot will be used  to retrive the missing 
# library and  build all  thing while building the Docker Image. 
# ----
# copyright (c) 2022, umar jUmarB@protonmail.com  <github/jukoo>  


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
DOCKER  STEP 
-------------
NOTE : ENSURE  YOU MAKE A SNAPSHOT  AND BUILD WITH DOCKER 
     e.g : the Rallib.txt should be  present inside the Docker Image 

1 =>  GET THE LIST OF AVAILABLE PACKAGE  PRESENT ON DOCKER IMAGE  
2 =>  COMPARE THEM AND EXTRACTE THE MISSING  
3 =>  BUILD  <dependencies.R> file  
4 =>  INSTALL  [all]      

"""  

class RpkgAutorun :  

    def __init__ (self )  :  
        self.dependencies_list  =  [] 
        self.cfmemb = []  
        self.cfval  = []  
        for k_config  , v_config  in  self.load_DC.items()  :  
            self.cfmemb.__iadd__([k_config])  
            self.cfval.__iadd__([v_config])  
            setattr(self, k_config, v_config)  


    @property  
    def load_DC  (self)  -> dict :  
        """ 
        bind   DEFAULT_CONFIG  Enum class to  RpkgAutorun  
        add  unique  attribute   
        """
        members ,  values  =  [ DEFAULT_CONFIG._member_names_ , list(DEFAULT_CONFIG._value2member_map_.keys()) ]  
        return dict (zip(members, values))  


    @property 
    def retrive_Rlibmodule  (self)  ->  list : # for docker image  
        """  
        fetch  all R  libmodule present in the host  
        list  all  libs module  present  in  /usr/lib/R/library  directory   
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
        collection all library module and save  it in   R script  file  
        
        """ 
        modules : list =  list(self.missing_lib)   
        if  modules.__len__().__eq__(0)  :  
            sys.__stdout__.write(f"no asymetric  dependencies found  [All requierments are satisfied] \n") 
            sys.exit(0)  

        dump_modobj =  os.open (self.DEFFNAME_REQ , os.O_CREAT|os.O_EXCL|os.O_WRONLY) 
        if  dump_modobj.__eq__(0):   
            sig.raise_signal(sig.SIGIO) 

        for module  in modules  :  
            module_name  :str = f"install.packages('{module}')\n"
            os.write ( dump_modobj ,module_name.encode() ) 
        os.close(dump_modobj)  
            
    
   
    def shell_exec  ( self , shell_command) : 
        """  
        Execute shell  command  
        """
        blackhole  = os.devnull  
        childprocess =  sbproc.Popen( shell_command ,  stdout=sbproc.PIPE ,  shell=True)  
        return  childprocess.wait()  

      
    def io_read(self , fileTarget)  : 
        if not  os.access(fileTarget , os.F_OK)  :  
            sys.__stderr__.write (f"""
            no snapshot found\n
            try to make a build  before   
            {sys.argv[0]}  -s | --snapshot  
            \n""") 
            
            sys.exit(1)  
             

        list_of_required_module   = os.open(fileTarget  , os.O_RDONLY) 
        assert  list_of_required_module.__gt__(0)   

        with m.mmap(list_of_required_module , length=0  ,access=m.ACCESS_READ)  as modobj : 
            modules =  modobj.read().decode() 
            modules = modules.split(chr(0xa))
            return modules[:-1] 

    @property 
    def install  ( self ) :  
        """ 
        read file  requirement  and  
        """
        if list(self.missing_lib).__len__().__eq__(0)  : 
            sys.__stdout__.write(f"all dependencies are satisfied \n")  
            sys.exit(0)  

        assert  os.access(self.DEFFNAME_REQ , os.F_OK | os.R_OK )  , f"no build found\n"
        childprocess_exec  =  self.shell_exec(f"Rscript {self.DEFFNAME_REQ}")   
 
def build ()   : 
    
    RPAR : RpkgAutorun  = RpkgAutorun()  
    
    stdarg  =  agp.ArgumentParser ()  
    stdarg.add_argument("-s" , "--snapshot" , action="store_true" ,  help ="Take  a snapshot of  R libraries  module ")  
    stdarg.add_argument("-b" , "--build-missing" , action="store_true" , help="build  R file  script with missing libraries")  
    stdarg.add_argument("-l" , "--list-missing"  , action="store_true"  ,help="list missing libraries  on stdout")   
    stdarg.add_argument("-i" , "--install" , action="store_true" , help="install  missing dependencies")  
    argv  = stdarg.parse_args() 
   
    if argv.snapshot      :  RPAR.snapshot   
    if argv.build_missing :  RPAR.autoBuild  
    if argv.list_missing  : 
        """
        list missing module 
        """
        misslib  : list  =  list ( RPAR.missing_lib)  
        if misslib.__len__().__gt__(0)  : 
            print(*misslib)  
            sys.exit (0)  

        sys.__stdout__.write(f"Everything  is Ok  ! \n")   

    if argv.install :  RPAR.install



if __name__.__eq__("__main__")   : 
    build() 
