#!/usr/bin/env Rscript

#-------------------
#-------------------
# 
#   Institut Pasteur Dakar:   Epidemiology Clinical Research & Data Science Unit
#                             
#   H3ABioNet             :   Tools & Web Services Work Package 
#                             Gen_Assoc Project

# This is code to run genotype inference analysis   

#                             * run Genotype inference option
#                             * file management after run
#                             * checking mendelian errors
#                             * generate report

# --- Requirements 
# Input     : ped, map in working directory
#           : Data with no Mendelian errors

# Dependency: Plink

args= commandArgs(trailingOnly = TRUE) 

#   --- Path to plink
plink_ = "plink" 

#   --- Install Required Packages

if(("optparse" %in% rownames(installed.packages())) == F){
  install.packages("optparse", dependencies=TRUE, repos="http://cran.r-project.org")
}
if(("stringr" %in% rownames(installed.packages())) == F){
  install.packages("stringr", dependencies=TRUE, repos="http://cran.r-project.org")
} 
if(("tidyverse" %in% rownames(installed.packages())) == F){
  install.packages("tidyverse", dependencies=TRUE, repos="http://cran.r-project.org")
} 
if(("lubridate" %in% rownames(installed.packages())) == F){
  install.packages("lubridate", dependencies=TRUE, repos="http://cran.r-project.org")
}
if(("nycflights13" %in% rownames(installed.packages())) == F){
  install.packages("nycflights13", dependencies=TRUE, repos="http://cran.r-project.org")
}


# --- load requiered packages
library(optparse)
library(stringr)
#library(tidyverse)
library(nycflights13)


# --- Functions

merge_genoInference_out_files <-function(dataset){
  
  # --- This function merges the output files of the genotype inference script to generate the new ped file
  
  file= read.delim(paste0("out1.ped"), header = F, stringsAsFactors = F)
  out.files  = list.files()[grep("out", list.files())]
  
  if(length(out.files) > 1){
    for(i in 2:length(out.files)){
      tmp = read.delim(paste0("out",i,".ped"), header = F, stringsAsFactors = F)
      file = cbind(file, tmp[, 7:ncol(tmp)])
    }
  }
  
  rm(tmp)
  return(file)
}

plink_check <- function(path_to_plink, ped_basename){
  
  # --- This function checks if Mendelian errors are present
  # --- Dependency: Plink
  
  plink_ = path_to_plink
  
  if (plink_!=""){
    suppressMessages(system(paste0(plink_ ," --file ", strsplit(opt$pedfile, ".ped") ," --mendel --out ", ped_basename,"_check")))
    
    # Check number of mendelian errors using log file
    cat("\nNumber of Mendelian errors : ")
    err = system(paste0("grep 'Mendel errors detected' ",ped_basename,"_check.log |cut -c15-17")) 
    
    system(paste0("mv *check* plink_report"))
  } 
  else (cat("-- Alert: Plink tool must be installed to check for Mendelian errors"))
}

#   --- Arguments

option_list = list(
  make_option(c("--pedfile"), type="character", help="name of 'ped' file", metavar="character"),
  make_option(c("--mapfile"), type="character", help="name of 'map' file", metavar="character"),
  make_option(c("--cores"), type="character", help="number of cores to genotype inference", metavar="character")
)

opt_parser = OptionParser(option_list=option_list)
opt = parse_args(opt_parser)


#-----------------------------------------------------------------------------------------------
#                                         START OF ANALYSIS                     
#-----------------------------------------------------------------------------------------------

# Move to user's temporary directory tmp

cmd= paste0("--pedfile ", opt$pedfile, " --mapfile ", opt$mapfile)

# --- Detect selected options 

flag <- unlist(str_split(c(cmd),"--"))[-1]

positions= NULL

for (i in 1:length(flag)){if (unlist(str_split(flag[i]," "))[2] == ""){positions = c(positions, i)}}

if (length(positions)>0){flag = flag[-positions]}


# --- D I S P L A Y   I N   T E R M I N A L 

cat("\n\n ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░\n\n")

cat("     ~ [ Genotype Inference ] ~      \n\n")
cat(" ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░\n\n")
x= Sys.time()
cat(paste0("\t __ Execution started at : ",as.character(Sys.time()),"\n"))
cat(paste0("\t __ Working directory : ", getwd()))

cat("\n\t __ Files:\n")
cat("\t\t __ ",opt$pedfile,"\n")
cat("\t\t __ ",opt$mapfile,"\n")

# ---  Pre-processing  ---

# -- File names
ped_basename = unlist(str_split(unlist(str_split(opt$pedfile,"/"))[length(unlist(str_split(opt$pedfile,"/")))], ".ped"))[1]
map_basename = unlist(str_split(unlist(str_split(opt$mapfile,"/"))[length(unlist(str_split(opt$mapfile,"/")))], ".map"))[1]

# -- Read Files

cat("\n [] Reading ped...\t")

chemin = str_remove(opt$pedfile,paste0(ped_basename,".ped"))
setwd(chemin)


#ped = read.delim(paste0(ped_basename,".ped"), header = F , stringsAsFactors = F)
ped = read.delim(opt$pedfile, header = F , stringsAsFactors = F)

cat("\n [✓] Done. \n\n")

# --- Check Mendel errors ---


# --- This part will need to be reviewed. Use plink (which shouldn't be a dependency) for Mendelian errors
# --- For now : path_to_plink = cste cuz tool present in the server : not a problem for Web Service version 


cat(" [] Checking Mendelian errors before inferring.. \n\n")     #test à faire pour si erreur mendelienne 
cat(" ____________________________________________________\n\n")
system(paste0("mkdir plink_report"))
plink_check(plink_, ped_basename)
cat("\nResults in plink_report")

cat("\n\n ____________________________________________________\n")

cat(" [✓] Check Mendelian errors: Done.\n")

# system("cp ../../../scripts/mendel_table.tsv .")      # path issues: scripts and dependencies must be copied in wd
# system("cp ../../../scripts/genoInference.R .")
# system("cp -r ../../../scripts/libs .")



date_gi_start = Sys.time()

cat("\n\t ✓ GENOTYPE INFERENCE OPTION ACTIVATED \n")

if(is.null(opt$cores)){opt$cores="1"}

cat("\n * Inferring genotypes...\n\n")

# define cutsize based on number of markers

if (isTRUE((ncol(ped)-6) > 1000)){                                                                                            # /!\
  cmd = paste0("Rscript genoInference.R --file ", ped_basename," --cutsize 100" ," --cores ", opt$cores ," --out out ")
}else if (isTRUE((ncol(ped)-6) < 50)) {
  cmd = paste0("Rscript genoInference.R --file ", ped_basename," --cutsize 10" ," --cores ", opt$cores ," --out out ")
}

system(cmd)

# output: out files - merging
inferred_ped = merge_genoInference_out_files()
system("rm out*")

cat(" ✓ Genotypes inferred. \n  Mendelian errors check... \n\n")


# --------- /!\ tester sur server & replace with function------------------------
write.table(inferred_ped, "inferred.ped", sep = "\t", quote = F, col.names = F, row.names = F)
system(paste0("cp ", map_basename,".map inferred.map"))

cat(" 🧪   inferred.ped + inferred.map written. [✓]  \n")
date_gi_finish = Sys.time()

execution_time = as.integer(difftime(date_gi_finish, date_gi_start, units = "secs"))
#--------------------------------------------------------------------------------

# -- total inferred 

cat("\n\n---  GENOTYPE INFERENCE SUMMARY: \n")
n_miss_before = length(ped[ped == '0 0'])
n_miss_after  = length(inferred_ped[inferred_ped == '0 0'])

#   Display on terminal
cat("\nMissing Values in -",ped_basename,"- :", n_miss_before,
    "markers \nMissing Values in new pedigree file :", n_miss_after,
    "markers \nNumber of inferred genotypes : ", n_miss_before - n_miss_after,"\n",
    "\n✓ genoInference_report.txt written.\n\n")
cat(paste0("\n⏱️ \tExecution time : ", execution_time, " secs \n"))

#   Report Generation. 
cat("Genotype Inference Report: \n\nSample name: ", ped_basename,
    "\nTotal execution time: ±",execution_time," secs",
    "\n\nMissing Values in -",ped_basename,"- :", n_miss_before,
    "markers \nMissing Values in new inferred pedigree file :", n_miss_after,
    "markers \nNumber of inferred genotypes : ", n_miss_before - n_miss_after,"\n", file = "genoInference_report.txt")


# --- mendelian errors check after
# cat("\n__________________________________________\n\n")
# plink_check(plink_, paste0(ped_basename,'_inferred'))
# cat("\nResults in plink_report")
# cat("\n\n__________________________________________________________\n\n")




