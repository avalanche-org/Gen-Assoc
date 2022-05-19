#!/usr/bin/env Rscript

#-------------------
#-------------------
#   Marieme Top |             @ : topmaryem@gmail.com 

#   Institut Pasteur Dakar:   Epidemiology Clinical Research & Data Science Unit
#                             Bioinformatics team 
#   H3ABioNet             :   Tools & Web Services Work Package 
#                             Gen_Assoc Project

# This is code to choose which ped file to use
# --- --- ---  Libraries

if(("optparse" %in% rownames(installed.packages())) == F){
  install.packages("optparse", dependencies=TRUE, repos="http://cran.r-project.org")
}
if(("stringr" %in% rownames(installed.packages())) == F){
  install.packages("stringr", dependencies=TRUE, repos="http://cran.r-project.org")
}

library(optparse)
library(stringr)

option_list = list(
  make_option(c("--genoinference"), type="character", help="answer to previous question", metavar="character"),
  make_option(c("--pedfile"), type="character", help="answer to previous question", metavar="character"),
  make_option(c("--mapfile"), type="character", help="answer to previous question", metavar="character")
)

opt_parser = OptionParser(option_list=option_list)
opt = parse_args(opt_parser)
 
#░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
# -- File names
ped_basename = unlist(str_split(unlist(str_split(opt$pedfile,"/"))[length(unlist(str_split(opt$pedfile,"/")))], ".ped"))[1]
map_basename = unlist(str_split(unlist(str_split(opt$mapfile,"/"))[length(unlist(str_split(opt$mapfile,"/")))], ".map"))[1]

chemin = str_remove(opt$pedfile,paste0(ped_basename,".ped"))
infered_pedfile_full_path  =  paste0(chemin , "inferred.ped") 
infered_mapfile_full_path  =  paste0(chemin , "inferred.map")  

cat(chemin)
cat("\n") 
cat(infered_pedfile_full_path) 
# -- Read file
ped = read.delim(opt$pedfile, header = F , stringsAsFactors = F)
inferred_ped = read.delim(infered_pedfile_full_path, header = F , stringsAsFactors = F)

# -- missing values
n_miss_before = length(ped[ped == '0 0'])
n_miss_after  = length(inferred_ped[inferred_ped == '0 0'])

#-- directories   
input_dir = paste0(chemin ,"input_files")   
gi_results = paste0(chemin,"genoInference_results")  
plink_report= paste0(chemin,"plink_report") 
gi_files_report  = paste0(chemin,"genoInference_report*")  

if (isTRUE(opt$genoinference == "yes")){
  cat(paste0("\n* Initial number of missing values: ",length(ped[ped == '0 0'])))
  #colnames(inferred_ped) <- colnames(ped)
  ped = inferred_ped
  cat("\n* Using ped file with -", n_miss_before - n_miss_after,"missing values retrieved\n")
  cat(paste0("\n -- New number of missing values: ",length(ped[ped == '0 0'])))
  
  cat("\n -- Moving input files to folder input_files/ \n\n ")

  system(paste("mkdir ", input_dir, " ; mv ",opt$pedfile ," ", opt$mapfile, input_dir))
  system(paste("mv ",infered_pedfile_full_path , opt$pedfile,"; mv ",infered_mapfile_full_path," ", opt$mapfile))
 
  system(paste("mkdir ", gi_results)) #,chemin,"genoInference_results/")
  system(paste("mv " , input_dir, " ", plink_report, " ", gi_files_report ," ", gi_results))
  
  #,chemin,"input_files ", chemin,"plink_report ",chemin,"genoInference_report* ", chemin,"genoInference_results/")
}

inferred_files_dir = paste0(chemin , "inferred_files")  
inferred_files_target = paste0(chemin,"inferred.*") 

if (isTRUE(opt$genoinference == "no")){
  cat("\nRows containing missing values will be dropped
Moving inferred files to inferred_files/
Using initial input files for analysis\n")
  system(paste("mkdir " , inferred_files_dir) )
  system(paste("mv " , inferred_files_target ," ",inferred_files_dir))
  cat(paste0("\nNumber of missing values: ",length(ped[ped == '0 0'])),"\n")
  
  #system("mkdir genoInference_results/")
  system(paste("mkdir ", gi_results)) #,chemin,"genoInference_results/")
  system(paste("mv " , inferred_files_dir, " ", plink_report, " ", gi_files_report ," ", gi_results))
  
  #system("mv inferred_files plink_report genoInference_report* genoInference_results/")
}
