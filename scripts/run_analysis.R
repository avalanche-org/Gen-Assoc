#!/usr/bin/env Rscript
#-------------------
#   Marieme Top |             @ : topmaryem@gmail.com 

#   Institut Pasteur Dakar:   Epidemiology Clinical Research & Data Science Unit Bioinformatics team 
#   H3ABioNet             :   Tools & Web Services Work Package - Gen_Assoc Project

# This is code to run m-TDT analysis   
#                             * prepare files for mTDT run
#                             * Genotype inference option: not integrated 

ls()
rm(list=ls())
  
args= commandArgs(trailingOnly = TRUE) 


#   --- Install and load Required Packages

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
#                                         START                     
#-----------------------------------------------------------------------------------------------

# --- Create a variable flag that will store the flags used to run this script. Only provided information will be stored. 

# Command skeleton
skeleton_cmd= paste0("--pedfile ", opt$pedfile, " --mapfile ", opt$mapfile, " --phenfile ", opt$phenfile, " --phen ",opt$phen, 
            " --markerset ", opt$markerset, " --nbsim ", opt$nbsim,  " --nbcores ", opt$nbcores," --gi ", opt$gi)

flag <- unlist(str_split(c(skeleton_cmd),"--"))[-1]

positions= NULL
for (i in 1:length(flag)){if (unlist(str_split(flag[i]," "))[2] == ""){positions = c(positions, i)}}
if (length(positions)>0){flag = flag[-positions]}


# --- D I S P L A Y   I N   T E R M I N A L 

cat("\n\n░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░\n         ___ __ ___ 
   _  __  | |  ' |  
  |||     | |__/ | : 𝘼 𝙩𝙤𝙤𝙡 𝙛𝙤𝙧 𝙈𝙪𝙡𝙩𝙞-𝙇𝙤𝙘𝙪𝙨 𝙏𝙧𝙖𝙣𝙨𝙞𝙢𝙞𝙨𝙨𝙞𝙤𝙣 𝘿𝙞𝙨𝙚𝙦𝙪𝙞𝙡𝙞𝙗𝙧𝙞𝙪𝙢 𝙏𝙚𝙨𝙩 
--------------------------------------------------------------------\n\n")

# get start time
x= Sys.time() 

cat(paste0("\t[•] Execution started at : ",as.character(Sys.time())))
cat(paste0("\n\t[•] Working directory : ", getwd()))  # is it relevant for the user?
cat("\n\t[•] Run name :",opt$jobtitle, "\n")
cat("\n\t[•] Run options :\n\n")

for (i in 1:length(flag)){
  
  # Selected flags
  
  # --  Files
  
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
  
  # --  Phenotype column
  
  if (isTRUE(str_split(flag[i],pattern = " ", simplify = TRUE)[1,1] == "phen")){
    cat(paste0(" -- Selected phenotype : column ",str_split(flag[i],pattern = " ", simplify = TRUE)[1,2] ,"\n"))
    flag = flag[-i]
  }
  
  # --  Markers
  
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

chemin = str_remove(opt$pedfile,paste0(ped_basename,".ped"))

# -- Read Files

cat("\n [ ] Reading ped, map, phen files...\t")

ped = read.delim(paste0(chemin,ped_basename,".ped"), header = F , stringsAsFactors = F)
map = read.delim(paste0(chemin,map_basename,".map"), header = F , stringsAsFactors = F)
phen = read.delim(paste0(chemin,phen_basename,".phen"), header = F , stringsAsFactors = F)

cat("\n [✓] Done. \n\n")


# ---   R U N    G E N O T Y P E   I N F E R E N C E  --------------------------------------------------
# ------------------------------------------------------------------------------------------------------

# Part to run genotype inference if it was selected in the GUI (gi = 1)





# ---   M -  T D T    A N A L Y S I S  -----------------------------------------------------------------
# ------------------------------------------------------------------------------------------------------

# ---  Create command to call script

skeleton_cmd = paste0(" --pedfile ", ped_basename, ".ped --mapfile ", map_basename, ".map --phenfile ", phen_basename, ".phen --phen ",opt$phen, 
                                    " --markerset ", opt$markerset, " --nbsim ", opt$nbsim,  " --nbcores ", opt$nbcores)

# - from command skeleton - get flags used
flag <- unlist(str_split(c(skeleton_cmd)," --"))[-1]

# - get rid of empty flags
positions= NULL
for (i in 1:length(flag)){if (unlist(str_split(flag[i]," "))[2] == ""){positions = c(positions, i)}}
if (length(positions)>0){flag = flag[-positions]}

setwd(paste0("vtmp/",opt$jobtitle))
mtdt_command = paste0("Rscript mtdt.R")

for (i in 1:length(flag)){
  mtdt_command = paste0(mtdt_command," --" , flag[i])
}

# Issue with mTDT using a one column map (remove when you get the new version of m-TDT)

if(ncol(map)>2){
  # Creating a new map file 
  write.table(map$V2, paste0(map_basename,"_rscol.map"),sep = "\t", quote = F, col.names = F, row.names = F)
  # Replace map file by map new map
  mtdt_command = str_replace(mtdt_command, paste0(map_basename,".map"), paste0(map_basename,"_rscol.map"))
}

# -- 
cat("\n [ ] Starting run.. \n\n ")
system(mtdt_command)

# -- remove intermediate files
cat("\n [✓] Analysis completed.  \n ")
 

# ------------   D I S P L A Y     O U T P U T  -----------------
# ---------------------------------------------------------------

if (file.exists("weighted_res_multilocus.csv")){              # if run worked 
  
  cat("\n [•]  R E S U L T S :   \n\t --- Run Characteristics :\n")
  make_scientific()
  output <- read.csv("weighted_res_multilocus_sci.csv", sep = ";")
  
  
  # ***************** T H E O R E T I C A L *****************
  # *********************************************************
  
  if (isTRUE(opt$nbsim  ==  0) | is.null(opt$nbsim) == TRUE) {   # check if it was an empirical run 
    
    cat(paste0("\n\t› Theoretical run performed on ", ped_basename, " data \n"))
    
    #-- S-M : no need corrected p-values
    
    if (is.null(opt$markerset) == TRUE){
      
      cat(" --  Single-Marker results \n")
      
      #    Rank 10 most significant markers
      cat("\n\n-------------------- 10 most significant markers --------------------\n\n")   
      
      t <- output[order(output$mTDT_asympt_Pval),]
      write.table(t[1:10,], "10_significants_markers",sep = "\t", quote = F, col.names = T, row.names = F)
      system("cat 10_significants_markers | column -t  > x; awk '{print $1,$2,$3,$4,$5,$6,$7}' x | column -t  ; rm  x 10_significants_markers")
      
      cat("\n_____________________________________________________________________\n\n")
      system("cat weighted_res_multilocus_sci.csv  | column -t -s ';' > x; awk '{print $1,$2,$3,$4,$5,$6,$7}' x | column -t -s ' '; rm x")
      cat("______________________________________________________________________________________________________________\n") 
    }
    
    
    #-- M-M : range by corrected p-values  
    
    if (is.null(opt$markerset) == FALSE){ 
      
      cat(" --  Multi-Marker results \n")
      
      cat("\n\n-------------------- Most significant markers --------------------\n\n")   
      
      t <- output[order(output$mTDT_asympt_Pval_FDR),]
      if(nrow(t)>10){
        write.table(t[1:10,], "10_significants_markers",sep = "\t", quote = F, col.names = T, row.names = F)
      }else{
        write.table(t[1:nrow(t),], "10_significants_markers", sep = "\t", quote = F, col.names = T, row.names = F)
      }
      
      system("cat 10_significants_markers | column -t  > x; awk '{print $1,$2,$3,$4,$5,$6,$7,$8}' x | column -t  ; rm  x 10_significants_markers")
      
      cat("\n_____________________________________________________________________\n\n") 
      system("cat weighted_res_multilocus_sci.csv  | column -t -s ';' > x; awk '{print $1,$2,$3,$4,$5,$6,$7,$8}' x | column -t -s ' '; rm x")
      cat("_____________________________________________________________________\n\n")
    }
  }
  
  # ***************** E M P I R I C A L ********************
  # ********************************************************
  
  if (isTRUE(opt$nbsim  > 0)){               # If nb of simulations renseigné  
    
    cat(paste0("\n\t› Empirical run performed on ", ped_basename, " data with ", opt$nbsim, " simulations \n"))
    
    #-- S-M no need corrected p-values
    if (is.null(opt$markerset) == TRUE){
      
      cat(" --  Single-Marker results \n")
      cat("\n--- 10 most significant markers --------------------\n\n")
      
      t <- output[order(output$mTDT_empirical_Pval_FDR),]
      write.table(t[1:10,], "10_significants_markers",sep = "\t", quote = F, col.names = T, row.names = F)
      system("cat 10_significants_markers | column -t  > x; awk '{print $1,$2,$3,$4,$5,$6,$7,$9}' x | column -t  ; rm  x 10_significants_markers")
      
      cat("\n_____________________________________________________________________ \n\n")
      system("cat weighted_res_multilocus_sci.csv  | column -t -s ';' > x; awk '{print $1,$2,$3,$4,$5,$6,$7,$9}' x | column -t -s ' '; rm x")
      cat("\n_____________________________________________________________________ \n\n")
      
    }
    
    #-- M-M range by corrected p-values  
    if (is.null(opt$markerset) == FALSE){
      
      cat(" --  Multi-Marker results  \n")
      cat("\n_____________________________________________________________________  \n\n")
      system("cat weighted_res_multilocus_sci.csv  | column -t -s ';'")
      
      cat("\n\n--- Most significant markers --------------------\n\n")
      
      t <- output[order(output$mTDT_empirical_Pval_FDR),]
      if(nrow(t)>10){
        write.table(t[1:10,], "10_significants_markers",sep = "\t", quote = F, col.names = T, row.names = F)
      }else{
        write.table(t[1:nrow(t),], "10_significants_markers", sep = "\t", quote = F, col.names = T, row.names = F)
      }
      system("cat 10_significants_markers | column -t ; rm 10_significants_markers")
      cat("\n_____________________________________________________________________  \n\n") 
    }
  }
  
  
  # ------------  F I L E   M A N A G E M E N T  ------------------
  # ---------------------------------------------------------------
  
  # --- Output filename
  
  if (is.null(opt$markerset) == TRUE ){
    name_ = paste0(ped_basename,"_SM_results")
  }
  if (is.null(opt$markerset) == FALSE){
    name_ = paste0(opt$markerset,"_MM_results")
  }
  
  # create output directory and move file
  system(paste0("mkdir ", name_,"; mv weighted* ", name_))
  
  # Delete unnecessary files
  # system(paste0("rm ",map_basename,"_rscol.map"))
  
  #system(paste0("mv plink_report ",name_))
  #system(paste0("mkdir -p ", name_,"/generated_files; mv *CompletePedigree* ", name_,"/generated_files/"))
  
  if (file.exists("genoInference_report.txt")){ 
    system(paste0("mv genoInference_report.txt ",name_))
    system(paste0("mv *inferred.* ",name_,"/generated_files/"))
  }
  
  #system("rm -r mtdt.R libs __MACOSX genoInference.R mendel_table.tsv")
  #------------
  
  x_= Sys.time()
  execution_time= as.numeric(difftime(x_,x))
  cat("\n Run finished [✓] \n--- ✅ \t Finished at: ",as.character(x_),
      "\n--- ⏱️\t Execution time : ", execution_time, " secs.\n--- 📂\t Results  in : ", name_, "\n\n\n")

  rm(list=ls())
  
  
}else{
  cat("There was a problem during the execution.")
}


