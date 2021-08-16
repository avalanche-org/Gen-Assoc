#!/usr/bin/env Rscript

#-------------------
#-------------------
#   Marieme Top
#   @ : topmaryem@gmail.com
#   IPD/ ECRDS/ BHI: avalanche-org: Gen_Assoc Project (H3ABioNet)

# This is code to run m-TDT analysis   
#                             * Genotype inference option: integrated 
#                             * prepare files for mTDT run
#                             * displays output in terminal
#                             * redirect output to file

# --- Requirements 
# Input     : User must provide clean dataset without Mendelian errors
#           : All files (ped, map, phen) in working directory
# Dependency: Plink

# --- Points for improvement: Ctrl+f : /!\ 

#-------------------

args= commandArgs(trailingOnly = TRUE) 

# IPD server 
# /!\ Desktop app : variable
plink_ = "/home/g4bbm/tools/Plink/plink" 

#   --- Install Required Packages

if(("optparse" %in% rownames(installed.packages())) == F){
  install.packages("optparse", dependencies=TRUE, repos="http://cran.r-project.org")
}

if(("stringr" %in% rownames(installed.packages())) == F){
  install.packages("optparse", dependencies=TRUE, repos="http://cran.r-project.org")
} 

library(optparse)
library(stringr)

#   --- Functions

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

merge_out_files <-function(dataset){
  
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
    system(paste0(plink_ ," --file ", ped_basename," --mendel --out ", ped_basename,"_check"))
    
    # Check number of mendelian errors using log file
    err = system(paste0("sed -n '25p' ",ped_basename,"_check.log |cut -c15-17")) 
    
    # -- Out
    if (isTRUE(err[1] == "0")){
      cat("No Mendelian errors")
    }
    if (isTRUE(err[1] != "0")) {
      cat("Mendelian errors detected")
    }
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
  make_option(c("--gi"), type="character", help="infer genotypes or not", metavar="character"))

opt_parser = OptionParser(option_list=option_list)
opt = parse_args(opt_parser)


#-----------------------------------------------------------------------------------------------
#                                         START OF ANALYSIS                     
#-----------------------------------------------------------------------------------------------

cat("\n --- Multi-locus Transmission Disequilibrium Test tool ---\n\n")
x= as.character(Sys.time())
cat(paste0("\t __ Started: ",x))
cat("\n\t __ Working directory:",getwd(), "\n\n")

cat("\n_______ Starting analysis ________ \n\n")

cmd= paste0("--pedfile ", opt$pedfile, " --mapfile ", opt$mapfile, " --phenfile ", opt$phenfile, " --phen ",opt$phen, 
            " --markerset ", opt$markerset, " --nbsim ", opt$nbsim,  " --nbcores ", opt$nbcores,"--gi ", opt$gi)

# --- Detect selected options ------------------------------------------------------------------------------------

flag <- unlist(str_split(c(cmd),"--"))[-1]

positions= NULL

for (i in 1:length(flag)){if (unlist(str_split(flag[i]," "))[2] == ""){positions = c(positions, i)}}

if (length(positions)>0){flag = flag[-positions]}

cat(" __ Selected options: \n")

for (i in 1:length(flag)){
  cat(paste0(" --",flag[i], "\n"))
  }

# ---  File management  ------------------------------------------------------------------------------------

# -- Basenames

ped_basename = unlist(str_split(unlist(str_split(opt$pedfile,"/"))[length(unlist(str_split(opt$pedfile,"/")))], ".ped"))[1]
map_basename = unlist(str_split(unlist(str_split(opt$mapfile,"/"))[length(unlist(str_split(opt$mapfile,"/")))], ".map"))[1]
phen_basename = unlist(str_split(unlist(str_split(opt$phenfile,"/"))[length(unlist(str_split(opt$phenfile,"/")))], ".phen"))[1]

# -- Read Files

cat("\n __ Reading files...\t")

ped = read.delim(opt$pedfile, header = F , stringsAsFactors = F)
map = read.delim(opt$mapfile, header = F , stringsAsFactors = F, sep = " ")
phen = read.delim(opt$phenfile, header = F , stringsAsFactors = F, sep = " ")

cat('Done. \n')

# --- Check Mendel errors ------------------------------------------------------------------------------------

# --- /!\ Plink based -------
# --- This part will need to be reviewed. Use plink (which shouldn't be a dependency) for Mendelian errors
# --- For now : path_to_plink = cste cuz tool present in the server
# --- To do   : path_to_plink variable for Desktop version

cat(" __ Check Mendelian errors")
plink_check(plink_, ped_basename)


# --- Genotype Inference  ------------------------------------------------------------------------------------

# -- /!\ Cutsize value depends on the sample size, out flag default value = out, Valeurs attribuées discutable
# -- /!\ Dependency : Plink

if (opt$gi == 1){
  
  cat("\n * Genotype Inference option selected...\n * Running ")
  
  if (isTRUE(ncol(ped) > 1000)){
    cmd = paste0("Rscript genoInference.R --file ", ped_basename," --cutsize 100" ," --cores ", opt$nbcores ," --out out")
  }
  else {
    cmd = paste0("Rscript genoInference.R --file ", ped_basename," --cutsize 50" ," --cores ", opt$nbcores ," --out out")
  }
  system(cmd)
  inferred_ped = merge_out_files()
  #sum(ped$V2 == inferred_ped$V2)         # -- control
  system("rm out*")
  
  # --- mendelian errors check after
  
  # --------- /!\ tester sur server & replace with function------------------------
  write.table(inferred_ped, "inferred.ped", sep = "\t", quote = F, col.names = F, row.names = F)
  system(paste0("cp ", map_basename,".map inferred.map"))
  system(paste0(plink_ ," --file inferred --mendel --out ", ped_basename,"_gi_check"))
  
  # -- out: check number of mendelian 
  
  system(paste0("sed -n '25p' ",ped_basename,"_gi_check.log |cut -c16-100"))  
  system("rm malaria_senegal_autosome_samp_clean_*")
  #--------------------------------------------------------------------------------
  
  # -- total inferred 
  
  n_miss_before = length(ped[ped == '0 0'])
  n_miss_after  = length(inferred_ped[inferred_ped == '0 0'])
  cat("Missing Values in -",ped_basename,"- :", n_miss_before, "markers \n")
  cat("Missing Values in new pedigree file :", n_miss_after, "markers \n")
  cat('Number of inferred genotypes : ', n_miss_before - n_miss_after )
  
}


# ---   Run M-TDT   ------------------------------------------------------------------------------------
# ------------------------------------------------------------------------------------------------------

# --- Change ped file if genotype inference option selected

if (isTRUE(opt$gi == 1)){
  ped = inferred_ped
}

# --- Process files with Complete Pedigree function

cat("\n * Preparing files for mTDT run... \n ")

mtdt_ped = rbind(ped, completePedigree(ped))
mtdt_map = paste0("M", (7:ncol(mtdt_ped)-6))

# --- Write CP files

cat("* Writing processed files... \n ")

write.table(mtdt_ped, paste0(unlist(str_split(ped_basename,".ped"))[1],"_CP.ped"),
            sep = "\t", quote = F, col.names = F, row.names = F)
write.table(mtdt_map, paste0(unlist(str_split(map_basename,".map"))[1],"_CP.map"),
            sep = "\t", quote = F, col.names = F, row.names = F)

# ---  Create command to call script

# - remove non m-tdt flags here
opt$gi="" 

# - update command
cmd= paste0("--pedfile ", opt$pedfile, " --mapfile ", opt$mapfile, 
            " --phenfile ",opt$phenfile, " --phen ",opt$phen,
            " --markerset ", opt$markerset, " --nbsim ", opt$nbsim,
            " --nbcores ", opt$nbcores,"--gi ", opt$gi)

flag <- unlist(str_split(c(cmd),"--"))[-1]
positions= NULL
for (i in 1:length(flag)){if (unlist(str_split(flag[i]," "))[2] == ""){positions = c(positions, i)}}
if (length(positions)>0){flag = flag[-positions]}

f=NULL

cmd = paste0("Rscript mtdt.R --pedfile ", 
             unlist(str_split(ped_basename,".ped"))[1],"_CP.ped --mapfile ",
             unlist(str_split(ped_basename,".ped"))[1],"_CP.map --phenfile ", 
             phen_basename,".phen ")

for (i in 4:length(flag)){
  f= paste0(f," --",flag[i])
}
cmd = paste0(cmd,f)

# -- 
cat("\n ** Starting run.. \n ")
system(cmd)

# -- remove intermediate files
system("rm *_CP.*")
cat("\n ** Analysis completed.  \n ")
x_= as.character(Sys.time())
cat(paste0("\t __ Finished: ",x_,"\n"))
cat(paste0("\t __ Total time: ",x_-x,"\n"))

#-----------------------------------------------------------------------------------------------
#                                         END OF ANALYSIS                     
#-----------------------------------------------------------------------------------------------



# --- Output Display  ----------------------------------------------------------------------------------
# ------------------------------------------------------------------------------------------------------

cat("\n ** Display of results in the terminal... \n")

output <- read.csv("weighted_res_multilocus.csv", sep = ";")


# --- Asymptotic 
# ----------------------------------------------------------------------------------------------------

# No simulations, default value = 0, nbcores default = 1

if (isTRUE(opt$nbsim  ==  0) | is.null(opt$nbsim) == TRUE) {
  cat("\n> Theorical run results\n\n")
  #-- S-M no need corrected p-values
  if (is.null(opt$markerset) == TRUE){
    #   Display output
    
    cat("\n_____________________________________________________________________\n\n")
    system("cat weighted_res_multilocus.csv  | column -t -s ';' > x; awk '{print $1,$2,$3,$4,$5,$6,$7}' x | column -t -s ' '; rm x")
    cat("\n ")
    
    #    Ranking : 10 most significant markers
    
    cat("\n--- Rank of the 10 most significant markers in descending order -------------\n\n\n")
    
    t <- output[order(output$mTDT_asympt_Pval),]
    write.table(t[1:10,], "10_significants_markers",sep = "\t", quote = F, col.names = T, row.names = F)
    system("cat 10_significants_markers | column -t  > x; awk '{print $1,$2,$3,$4,$5,$6,$7}' x | column -t  ; rm  x 10_significants_markers")
    
    cat("\n_____________________________________________________________________\n\n") 
  }
  #-- M-M range by corrected p-values  
  if (is.null(opt$markerset) == FALSE){
    
    #   Display output
    
    cat("\n_____________________________________________________________________\n\n")
    system("cat weighted_res_multilocus.csv  | column -t -s ';' > x; awk '{print $1,$2,$3,$4,$5,$6,$7,$8}' x | column -t -s ' '; rm x")
    cat("\n ")
    
    #    Ranking : 10 most significant markers
    
    cat("\n--- Rank of the 10 most significant markers in descending order --------------------\n\n\n")
    
    t <- output[order(output$mTDT_asympt_Pval_FDR),]
    write.table(t[1:10,], "10_significants_markers",sep = "\t", quote = F, col.names = T, row.names = F)
    system("cat 10_significants_markers | column -t  > x; awk '{print $1,$2,$3,$4,$5,$6,$7,$8}' x | column -t  ; rm  x 10_significants_markers")
    
    cat("\n_____________________________________________________________________\n\n") 
    
  }
  
}

# --- Empirical 
# ----------------------------------------------------------------------------------------------------

# Number of simulations selected

if (isTRUE(opt$nbsim  > 0)){
  cat("\n> Empirical run results\n\n")
  #-- S-M no need corrected p-values
  if (is.null(opt$markerset) == TRUE){
    
    #   Output without corrected p-values
    cat("\n_____________________________________________________________________ \n\n")
    system("cat weighted_res_multilocus.csv  | column -t -s ';' > x; awk '{print $1,$2,$3,$4,$5,$6,$7,$9}' x | column -t -s ' '; rm x")
    
    ### Classement selon p-value croissant
    
    cat("\n--- Rank of the 10 most significant markers in descending order ---------------------\n\n\n")
    t <- output[order(output$mTDT_empirical_Pval_FDR),]
    
    write.table(t[1:10,], "10_significants_markers",sep = "\t", quote = F, col.names = T, row.names = F)
    system("cat 10_significants_markers | column -t  > x; awk '{print $1,$2,$3,$4,$5,$6,$7,$9}' x | column -t  ; rm  x 10_significants_markers")
    
    cat("\n_____________________________________________________________________ \n\n")
    
  }
  
  #-- M-M range by corrected p-values  
  if (is.null(opt$markerset) == FALSE){
    
    ### Output with corrected p-values
    
    cat("\n_____________________________________________________________________  \n\n")
    system("cat weighted_res_multilocus.csv  | column -t -s ';'")
    
    ### Classement selon p-value croissant
    
    cat("\n--- Rank of the 10 most significant markers in descending order ---------------------\n\n\n")
    t <- output[order(output$mTDT_empirical_Pval_FDR),]
    
    write.table(t[1:10,], "10_significants_markers",sep = "\t", quote = F, col.names = T, row.names = F)
    system("cat 10_significants_markers | column -t ; rm 10_significants_markers")
    
    cat("\n_____________________________________________________________________  \n\n") 
  }
}


# --- File Management 
# ------------------------------------------------------------------------------------------------------

#---- Output filename based on pedfile name

if (is.null(opt$markerset) == TRUE ){
  name_ = paste0(unlist(str_split(ped_basename,".ped"))[1],"_SM_results")
}
if (is.null(opt$markerset) == FALSE){
  name_ = paste0(unlist(str_split(ped_basename,".ped"))[1],"_MM_results")
}

cmd = paste0("mkdir ", name_,"; mv weighted* ", name_," ;  rm ",phen_basename ,".phen ")
system(cmd)

#------------

cat("\n ** Run finished. Results are written in ", name_, "\n\n\n")
rm(list=ls())
