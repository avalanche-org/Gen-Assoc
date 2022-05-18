#!/usr/bin/env Rscript

#-------------------
#-------------------
#   Marieme Top |             @ : topmaryem@gmail.com 

#   Institut Pasteur Dakar:   Epidemiology Clinical Research & Data Science Unit
#                             Bioinformatics team 
#   H3ABioNet             :   Tools & Web Services Work Package 
#                             Gen_Assoc Project

# This is code to run m-TDT analysis   

#                             * prepare files for mTDT run
#                             * Genotype inference option: integrated 
#                             * output file : folder containing 

# --- Requirements 
# Input     : ped, map, phen files must be in working directory
#           : Data with no Mendelian errors
# Dependency: Plink

# --- Points for improvement: Ctrl+f : /!\ 
# command to test in terminal:
# Rscript ~/Gen_Assoc/scripts/run_analysis.R --pedfile 25markers.ped  --mapfile 25markers.map --phenfile  25markers.phen --phen 1 --markerset  1,2,24 --nbsim  100 --nbcores 4 --gi 1 --jobtitle My_first_analysis
#-------------------

args= commandArgs(trailingOnly = TRUE) 

#   --- Path to plink
plink_ = "/home/g4bbm/tools/Plink/plink" 

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

completePedigree <- function(dbwork){
  
  # --- Prepare ped file for m-TDT run
  
  fathers = unique(setdiff(unique(dbwork$V3), dbwork$V2))
  fathers = fathers[!(fathers%in%c("0"))]
  fathers_famIDs = unique(dbwork[dbwork$V3 %in% fathers, c(1,3)])
  
  mothers = unique(setdiff(unique(dbwork$V4), dbwork$V2))
  mothers = mothers[!(mothers%in%c("0"))]
  mothers_famIDs = unique(dbwork[dbwork$V4 %in% mothers, c(1,4)])
  
  dataset = NULL
  for(i in 1:nrow(fathers_famIDs)){
    dataset = rbind(dataset, c(fathers_famIDs[i,1], fathers_famIDs[i,2], "0", "0", "1", "2", rep(NA, length(1:(ncol(dbwork)-6)))))
  }
  for(i in 1:nrow(mothers_famIDs)){
    dataset = rbind(dataset, c(mothers_famIDs[i,1], mothers_famIDs[i,2], "0", "0", "2", "2", rep(NA, length(1:(ncol(dbwork)-6)))))
  }
  
  return(dataset)
}


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

make_scientific <- function(){
  # --- This function: Make scientific for decimals > 4
  results=read.csv("weighted_res_multilocus.csv", header = T, sep = ";")
  for (column in 7:ncol(results)){
    c_name = colnames(results)[column]
    results[,c_name] = format(as.numeric(gsub(",",".",results[,c_name])), scientific=TRUE, digits=3)
  }
  write.csv2(results,file = "weighted_res_multilocus_sci.csv", quote=F, row.names=F)
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
  make_option(c("--phenfile"), type="character", help="name of phenotype file", metavar="character"),
  make_option(c("--phen"), type="numeric", default = "1", help="the position of the phenotype (only one) to analyze from the 'phenotype' file without counting the 2 first columns", metavar="character"),
  make_option(c("--nbsim"), type="numeric", help="number of simulations for the computation of empirical P-values. The default value is 0 and will correspond to the case where only asymptotic P-values are provided. If sample size is limited or if there is LD (linkage disequilibrium) among markers analyzed, asymptotic theory is no more valid and then empirical P-values should be computed using simulations", metavar="character"),
  make_option(c("--nbcores"), type="numeric", help="number of cores to use for the run, if the user wants to speed up the run by using multiple cores, as the program can run in parallelized at the simulation step if included to obtain empirical P-values. So, this option is useful only if --nbsim  option is used.``", metavar="character"),
  make_option(c("--markerset"), type="character", help="we advise at the running step to include a limited number of markers, e.g. 3 to 5, (using the markerset option describe below) to avoid both (i) facing a huge number of alternative hypotheses to test and (i i) having sparse count tables for transmitted versus non transmitted alleles combinations across markers. As discussed in the method paper, MTDT has not been optimized for screen multiple markers effect within a large number of markers, but within a set p redefined subgroup of markers of interest, e.g. markers with intermediate marginal effect.", metavar="character"),
  make_option(c("--gi"), type="character", help="infer genotypes or not", metavar="character"),
  make_option(c("--jobtitle"), type="character", help="user's working directory", metavar="character")
)

opt_parser = OptionParser(option_list=option_list)
opt = parse_args(opt_parser)


#-----------------------------------------------------------------------------------------------
#                                         START OF ANALYSIS                     
#-----------------------------------------------------------------------------------------------

# Move to user's temporary directory tmp


cmd= paste0("--pedfile ", opt$pedfile, " --mapfile ", opt$mapfile, " --phenfile ", opt$phenfile, " --phen ",opt$phen, 
            " --markerset ", opt$markerset, " --nbsim ", opt$nbsim,  " --nbcores ", opt$nbcores," --gi ", opt$gi)

# --- Detect selected options 

flag <- unlist(str_split(c(cmd),"--"))[-1]

positions= NULL

for (i in 1:length(flag)){if (unlist(str_split(flag[i]," "))[2] == ""){positions = c(positions, i)}}

if (length(positions)>0){flag = flag[-positions]}


# --- D I S P L A Y   I N   T E R M I N A L 

cat("\n\n ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░\n\n")

cat("      [ M - T D T ] ~  A tool for Multi-Locus Transimission Disequilibrium Test     \n\n")
cat(" --------------------------------------------------------------------------------------\n\n")
x= Sys.time()
cat(paste0("\t __ Execution started at : ",as.character(Sys.time())))
cat(paste0("\t __ Working directory : ", getwd()))
cat("\n\t __ Run name :",opt$jobtitle, "\n")

cat("\n\t __ Options in effect:\n\n")


for (i in 1:length(flag)){
  
  # Affichage des options
  
  # --  FILES
  if (isTRUE(str_split(flag[i],pattern = " ", simplify = TRUE)[1,1] == "pedfile")){
    cat(paste0(" -- Pedigree file : ",str_split(flag[i],pattern = " ", simplify = TRUE)[1,2] ,"\n"))
    flag = flag[-i]
  }
  if (isTRUE(str_split(flag[i],pattern = " ", simplify = TRUE)[1,1] == "mapfile")){
    cat(paste0(" -- Map file : ",str_split(flag[i],pattern = " ", simplify = TRUE)[1,2] ,"\n"))
    flag = flag[-i]
  }
  if (isTRUE(str_split(flag[i],pattern = " ", simplify = TRUE)[1,1] == "phenfile")){
    cat(paste0(" -- Phenotype file : ",str_split(flag[i],pattern = " ", simplify = TRUE)[1,2] ,"\n"))
    flag = flag[-i]
  }
  
  # --  Selected phenotype column
  if (isTRUE(str_split(flag[i],pattern = " ", simplify = TRUE)[1,1] == "phen")){
    cat(paste0(" -- Selected phenotype : column ",str_split(flag[i],pattern = " ", simplify = TRUE)[1,2] ,"\n"))
    flag = flag[-i]
  }
  
  # --  Selected markers
  if (isTRUE(str_split(flag[i],pattern = " ", simplify = TRUE)[1,1] == "markerset")){
    cat(paste0(" -- Selected markers : ",str_split(flag[i],pattern = " ", simplify = TRUE)[1,2] ,"\n"))
    flag = flag[-i]
  }
  
  # --  Number of simulations
  if (isTRUE(str_split(flag[i],pattern = " ", simplify = TRUE)[1,1] == "nbsim")){
    cat(paste0(" -- Number of simulations : ",str_split(flag[i],pattern = " ", simplify = TRUE)[1,2] ,"\n"))
    flag = flag[-i]
  }
  
  # --  Number of cores 
  if (isTRUE(str_split(flag[i],pattern = " ", simplify = TRUE)[1,1] == "nbcores")){
    cat(paste0(" -- Number of cores for analysis : ",str_split(flag[i],pattern = " ", simplify = TRUE)[1,2] ,"\n"))
    flag = flag[-i]
  }
  
  # --  Genotype Inference option
  
  if (isTRUE(flag[i]=="gi 1")){
    cat(paste0(" -- Genotype Inference option selected \n"))
    flag = flag[-i]
  }
  if (isTRUE(flag[i]=="gi 0")){
    cat(paste0(" -- Genotype Inference option not selected \n"))
    flag = flag[-i]
  }
  if (is.na(flag[i])){
    break
  }
}


# ---  Pre-processing  -----------------------------------------------

# -- File names
ped_basename = unlist(str_split(unlist(str_split(opt$pedfile,"/"))[length(unlist(str_split(opt$pedfile,"/")))], ".ped"))[1]
map_basename = unlist(str_split(unlist(str_split(opt$mapfile,"/"))[length(unlist(str_split(opt$mapfile,"/")))], ".map"))[1]
phen_basename = unlist(str_split(unlist(str_split(opt$phenfile,"/"))[length(unlist(str_split(opt$phenfile,"/")))], ".phen"))[1]

# -- Read Files

chemin = str_remove(opt$pedfile,paste0(ped_basename,".ped"))
setwd(chemin)

cat("\n [] Reading ped, map, phen files...\t")

# A commenter pour serveur. 
#system(paste0("cp ../../", ped_basename,".* ."))   # /!\ tmp

ped = read.delim(paste0(ped_basename,".ped"), header = F , stringsAsFactors = F)
map = read.delim(paste0(map_basename,".map"), header = F , stringsAsFactors = F)
phen = read.delim(paste0(phen_basename,".phen"), header = F , stringsAsFactors = F)

cat("\n [✓] Done. \n\n")


# --- Check Mendel errors ------------------------------------------------------------------------------------

# --- /!\ Plink based ------------------------------------------------------------------------------------

# --- This part will need to be reviewed. Use plink (which shouldn't be a dependency) for Mendelian errors
# --- For now : path_to_plink = cste cuz tool present in the server : not a problem for Web Service version 

cat(" [] Check Mendelian errors with Plink.. \n\n")
cat(" ____________________________________________________\n\n")
system(paste0("mkdir plink_report"))
plink_check(plink_, ped_basename)
cat("\nResults in plink_report")
cat("\n\n ____________________________________________________\n")
cat(" [✓] Check Mendelian errors: Done.\n")

# system("cp ../../../scripts/mendel_table.tsv .")      # path issues: scripts and dependencies must be copied in wd
# system("cp ../../../scripts/genoInference.R .")
# system("cp ../../../scripts/mtdt.R .")  
# system("cp -r ../../../scripts/__MACOSX .")
# system("cp -r ../../../scripts/libs .")



# ---   M -  T D T    A N A L Y S I S  -----------------------------------------------------------------
# ------------------------------------------------------------------------------------------------------

# --- C O M P L E T E   P E D I G R E E 

cat("\n\n------------------------- \n\n [✓] Preparing files for mTDT run... \n ")

mtdt_ped = suppressWarnings(rbind(ped, completePedigree(ped))) ## Warning: number of columns [or rows] of result is not a multiple of vector length
mtdt_map = paste0("M", (7:ncol(mtdt_ped)-6))

# --- Write CP files

cat(" [✓] Writing processed files ")
name_= NULL
if (is.null(opt$markerset)){
  write.table(mtdt_ped, paste0(unlist(str_split(ped_basename,".ped"))[1],"_CompletePedigree.ped"),
              sep = "\t", quote = F, col.names = F, row.names = F)
  write.table(mtdt_map, paste0(unlist(str_split(map_basename,".map"))[1],"_CompletePedigree.map"),
              sep = "\t", quote = F, col.names = F, row.names = F)
} else{
  markers= unlist(str_split(string = opt$markerset, pattern = ","))
  for(marker in markers){
    name_ = paste0(name_, marker, "_")
  }
  write.table(mtdt_ped, paste0(name_,"CompletePedigree.ped"),sep = "\t", quote = F, col.names = F, row.names = F)
  write.table(mtdt_map, paste0(name_,"CompletePedigree.map"),sep = "\t", quote = F, col.names = F, row.names = F)
}

# ---  Create command to call script


# - update command
cmd= paste0("--pedfile ", opt$pedfile, " --mapfile ", opt$mapfile, 
            " --phenfile ",opt$phenfile, " --phen ",opt$phen,
            " --markerset ", opt$markerset, " --nbsim ", opt$nbsim,
            " --nbcores ", opt$nbcores)

flag <- unlist(str_split(c(cmd),"--"))[-1]
positions= NULL
for (i in 1:length(flag)){if (unlist(str_split(flag[i]," "))[2] == ""){positions = c(positions, i)}}
if (length(positions)>0){flag = flag[-positions]}

f=NULL

if(is.null(opt$markerset)){
  cmd = paste0("Rscript mtdt.R --pedfile ", 
               unlist(str_split(ped_basename,".ped"))[1],"_CompletePedigree.ped --mapfile ",
               unlist(str_split(ped_basename,".ped"))[1],"_CompletePedigree.map --phenfile ", 
               phen_basename,".phen ")
}else {
 cmd =  paste0("Rscript mtdt.R --pedfile ", 
         paste0(name_,"CompletePedigree.ped --mapfile "),name_,"CompletePedigree.map --phenfile ", 
         phen_basename,".phen ")
}


for (i in 4:length(flag)){
  f= paste0(f," --",flag[i])
}
cmd = paste0(cmd,f)

# -- 
cat("\n   [ ] Starting run.. \n\n ")
system(cmd)

# -- remove intermediate files

cat("\n   [✓] Analysis completed.  \n ")

#-----------------------------------------------------------------------------------------------
#                                         OUTPUT DISPLAY                     
#-----------------------------------------------------------------------------------------------

#   Affichage de la sortie dépendamment de l'option choisie entre run asymptotique et empirique
#   Ranking 10 most significant markers

# ------------------------------------------------------------------------------------------------------

cat("\n [•]  R E S U L T S :   \n\t --- Run Characteristics :")

#output <- read.csv("weighted_res_multilocus.csv", sep = ";")
make_scientific()
output <- read.csv("weighted_res_multilocus_sci.csv", sep = ";")


# --- Asymptotic -------------------------------------------------------------
# -------------------------------------------------------------------------

if (isTRUE(opt$nbsim  ==  0) | is.null(opt$nbsim) == TRUE) {
  
  cat(" Theoritical run ")
  
  #-- S-M : no need corrected p-values
  
  if (is.null(opt$markerset) == TRUE){
    
    cat(" --  Single-Marker  \n\n")
    cat("\n_____________________________________________________________________\n\n")
    system("cat weighted_res_multilocus_sci.csv  | column -t -s ';' > x; awk '{print $1,$2,$3,$4,$5,$6,$7}' x | column -t -s ' '; rm x")
    
    #    Rank 10 most significant markers
    
    cat("\n\n--- 10 most significant markers --------------------\n\n")   
    
    t <- output[order(output$mTDT_asympt_Pval),]
    write.table(t[1:10,], "10_significants_markers",sep = "\t", quote = F, col.names = T, row.names = F)
    system("cat 10_significants_markers | column -t  > x; awk '{print $1,$2,$3,$4,$5,$6,$7}' x | column -t  ; rm  x 10_significants_markers")
    
    cat("\n______________________________________________________________________________________________________________\n\n") 
  }
  
  
  #-- M-M : range by corrected p-values  
  
  if (is.null(opt$markerset) == FALSE){  
    
    cat(" --  Multi-Marker  \n\n")
    cat("_____________________________________________________________________\n\n")
    system("cat weighted_res_multilocus_sci.csv  | column -t -s ';' > x; awk '{print $1,$2,$3,$4,$5,$6,$7,$8}' x | column -t -s ' '; rm x")
    
    #    Ranking : 10 most significant markers
    
    cat("\n\n--- Most significant markers --------------------\n\n")
    
    t <- output[order(output$mTDT_asympt_Pval_FDR),]
    if(nrow(t)>10){
      write.table(t[1:10,], "10_significants_markers",sep = "\t", quote = F, col.names = T, row.names = F)
    }
    else{
      write.table(t[1:nrow(t),], "10_significants_markers", sep = "\t", quote = F, col.names = T, row.names = F)
    }
    system("cat 10_significants_markers | column -t  > x; awk '{print $1,$2,$3,$4,$5,$6,$7,$8}' x | column -t  ; rm  x 10_significants_markers")
    
    cat("\n_____________________________________________________________________\n\n") 
    
  }
  
}

# --- Empiric -------------------------------------------------------------
# -------------------------------------------------------------------------

if (isTRUE(opt$nbsim  > 0)){        # Number of simulations selected
  cat(" Empirical run ")
  
  #-- S-M no need corrected p-values
  if (is.null(opt$markerset) == TRUE){
    
    cat(" --  Single-Marker  \n")
    
    cat("\n\n\n_____________________________________________________________________ \n\n")
    system("cat weighted_res_multilocus_sci.csv  | column -t -s ';' > x; awk '{print $1,$2,$3,$4,$5,$6,$7,$9}' x | column -t -s ' '; rm x")

    cat("\n\n--- 10 most significant markers --------------------\n\n")
    
    t <- output[order(output$mTDT_empirical_Pval_FDR),]
    write.table(t[1:10,], "10_significants_markers",sep = "\t", quote = F, col.names = T, row.names = F)
    system("cat 10_significants_markers | column -t  > x; awk '{print $1,$2,$3,$4,$5,$6,$7,$9}' x | column -t  ; rm  x 10_significants_markers")
    
    cat("\n_____________________________________________________________________ \n\n")
    
  }
  
  #-- M-M range by corrected p-values  
  if (is.null(opt$markerset) == FALSE){

    cat(" --  Multi-Marker  \n")
    
    cat("\n_____________________________________________________________________  \n\n")
    system("cat weighted_res_multilocus_sci.csv  | column -t -s ';'")
    
    cat("\n\n--- Most significant markers --------------------\n\n")
    t <- output[order(output$mTDT_empirical_Pval_FDR),]
    
    if(nrow(t)>10){
      write.table(t[1:10,], "10_significants_markers",sep = "\t", quote = F, col.names = T, row.names = F)
    }
    else{
      write.table(t[1:nrow(t),], "10_significants_markers", sep = "\t", quote = F, col.names = T, row.names = F)
    }
    system("cat 10_significants_markers | column -t ; rm 10_significants_markers")
    
    
    cat("\n_____________________________________________________________________  \n\n") 
  }
}


# --- File Management 
# ------------------------------------------------------------------------------------------------------

# --- Output filename based on pedfile name

if (is.null(opt$markerset) == TRUE ){
  name_ = paste0(unlist(str_split(ped_basename,".ped"))[1],"_SM_results")
}
if (is.null(opt$markerset) == FALSE){
  
  name_ = paste0( "MultiMarker_",name_,"results")
}

# create output directory and move file

system(paste0("mkdir ", name_,"; mv weighted* ", name_))
system(paste0("mv plink_report ",name_))
system(paste0("mkdir -p ", name_,"/generated_files; mv *CompletePedigree* ", name_,"/generated_files/"))

if (file.exists("genoInference_report.txt")){ 
  system(paste0("mv genoInference_report.txt ",name_))
  system(paste0("mv *inferred.* ",name_,"/generated_files/"))
  }

system("rm -r mtdt.R libs __MACOSX genoInference.R mendel_table.tsv")
#------------

x_= Sys.time()
execution_time= as.numeric(difftime(x_,x))
cat("\n Run finished [✓] \n---  Finished at: ",as.character(x_),
    "\n--- ⏱️\tExecution time : ", execution_time, " secs.\n--- 📂\tResults  in : ", name_, "\n\n\n")

rm(list=ls())
