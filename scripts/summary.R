#!/usr/bin/env Rscript
args = commandArgs(trailingOnly = TRUE) 

# --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---  
#   Marieme Top
#   @ : topmaryem@gmail.com
#   IPD/ ECRDS/ BHI: avalanche-org: Gen_Assoc Project (H3ABioNet)

#         This is code to generate summary statistics of your data   
#         Advice for Running Genotype Inference | Doing an empirical analysis or not (dev) 

# --- Requirements 
# Input     : ped, map and phen files given as arguments
#           : User must provide clean dataset without Mendelian errors
#           : All files in working directory
# Dependency: Plink

# --- Points for improvement: Ctrl+f : /!\ 
# --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- 

# --- --- ---  Packages

if(("optparse" %in% rownames(installed.packages())) == F){
  install.packages("optparse", dependencies=TRUE, repos="http://cran.r-project.org")
} 
if(("stringr" %in% rownames(installed.packages())) == F){
  install.packages("optparse", dependencies=TRUE, repos="http://cran.r-project.org")
} 
if(("descr" %in% rownames(installed.packages())) == F){
  install.packages("descr", dependencies=TRUE, repos="http://cran.r-project.org")
} 
if(("dplyr" %in% rownames(installed.packages())) == F){
  install.packages("dplyr", dependencies=TRUE, repos="http://cran.r-project.org")
} 

# --- --- ---  Functions

# -- [count the total number of nuclear families]
Numb_trios <- function(dataset){
  parents= tibble()
  for (i in dataset$V2){
    parents= rbind(parents,dataset[dataset$V2 == i, c(3,4)])
  }
  parents = parents[-c(which(parents$V3 == 0)), ]  #remove founders
  return(nrow(unique(parents)))
}

# -- [return all alleles for a marker in a dataset]
get_alleles <- function(marker_position,dataset){   
  total_allele=tibble()
  for(ind in 1:nrow(dataset)){
    marker = gsub(" ", "", dataset[ind,marker_position])      # get alleles
    alleles=tibble()
    allele1=substr(marker, start = 1, stop = 1)
    allele2 = substr(marker, start = 2, stop = 2)
    
    if (isTRUE(allele1 != "0" | allele2 != "0")){             # exclude missing genotypes
      alleles=rbind(allele1,allele2) #  (allele1 | allele 2)  
    }
    total_allele= rbind(total_allele,alleles)                 
  }
  return(total_allele$V1)
}


# --- --- ---  Libraries

library(optparse)
library(stringr)
library(descr)
suppressMessages(library(dplyr))

# --- --- ---  Collect arguments

option_list = list(
  make_option(c("--pedfile"), type="character", help="ped file", metavar="character"),
  make_option(c("--mapfile"), type="character", help="map file", metavar="character"),
  make_option(c("--phenfile"), type="character", help="phenotype file", metavar="character")
)

opt_parser = OptionParser(option_list=option_list)
opt = parse_args(opt_parser)

path_to_file = unlist(str_split(opt$pedfile, unlist(str_split(opt$pedfile,"/"))[length(unlist(str_split(opt$pedfile,"/")))]))[1]

opt$pedfile = unlist(str_split(opt$pedfile,"/"))[length(unlist(str_split(opt$pedfile,"/")))]
opt$mapfile = unlist(str_split(opt$mapfile,"/"))[length(unlist(str_split(opt$mapfile,"/")))]
opt$phenfile = unlist(str_split(opt$phenfile,"/"))[length(unlist(str_split(opt$phenfile,"/")))]

if(is.null(opt$pedfile)) {cat("Option --pedfile is required. \n Execution stopped.")}
if(is.null(opt$mapfile)) {cat("Option --mapfile is required. \n Execution stopped.")}
if(is.null(opt$phenfile)) stop(cat("Option --phenfile is required. \n Execution stopped."))


cat("\n\n----- Summary Statistics -----------\n")
cat("____________________________________\n\n")
cat(" __ Working directory:",getwd(),"\n")
cat(" __ Run started at: ",as.character(Sys.time()),"\n")

# --- Files

ped = read.delim(paste0(path_to_file, opt$pedfile), header = F , stringsAsFactors = F)
map = read.delim(paste0(path_to_file, opt$mapfile), header = F , stringsAsFactors = F)
if(ncol(map)==1){map = read.delim(paste0(path_to_file, opt$mapfile), header = F , stringsAsFactors = F, sep = " ")}
phen = read.delim(paste0(path_to_file, opt$phenfile), header = F , stringsAsFactors = F)
if(ncol(phen)==1){phen = read.delim(paste0(path_to_file, opt$phenfile), header = F , stringsAsFactors = F, sep = " ")}

# ---   SUMMARY STATISTICS  ---
# --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- 

cat("\nGenerating Summary Statistics..\n")

cat("\n   ---  Data loaded \n")
cat("\t", opt$pedfile,"\n\t", opt$mapfile,"\n\t", opt$phenfile,"\n")

cat("\n   ---  Data description \n")   
cat("\tFamilies :", length(unique(ped$V1)),"\n")
cat("\tFounders :", length(which(ped$V3 == 0)),"\n")
cat("\tNonfounders :", nrow(ped)-length(which(ped$V3 == 0)),"\n")
cat("\tNuclear Families :", Numb_trios(ped),"\n\n")

cat("\tSex description \n")
cat("\t",nrow(ped), "individuals","\t",length(which(ped$V5== "1")), "males", length(which(ped$V5== "2")), "females \n\n")
cat("\tVariants\n")
cat("\t",nrow(map)," variants \n")
cat("\tPhenotype \n")
cat("\tin" ,opt$phenfile,"\t:" ,(ncol(phen)-2)," phenotype(s) detected\n\n")

#list_phenotypes
phenotypes = colnames(phen)[3:ncol(phen)]
i= 1; count = 0

for (i in 1:length(phenotypes)){  # parcourir les phenotypes
  # Phenotype name
  pheno = phenotypes[i]   
  pheno_value = phen[1, pheno]    # get first value to test it 
  
  # Detect if quantitative or categorial
  if(isFALSE(pheno_value%%1==0) && isTRUE(pheno_value!=0)){count = count + 1}
  
  # Display
  cat("-- ","Phenotype ",phenotypes[i], " : ")
  if(count>=1){
    cat(" quantitative -------------\n\n")
    cat( descr(phen[,phenotypes[i]]))
  }
  if (count==0){
    cat(" categorial   -------------\n\n")
    cat(" Levels:\t", sort(unique(phen[,phenotypes[i]])),"\n Counts:\t", table(phen[,phenotypes[i]]),"\n")
  }
  
  cat("\n")
  count = 0
}
suppressMessages(rm(phenotypes,i))

cat("   -  Missing genotypes \n")
cat("\tmissing values at \t: ", length(ped[ped == '0 0']), "positions /",nrow(ped)* (ncol(ped)-6),"total\n")
cat("\tPercentage missing values\t:  ", (length(ped[ped == '0 0'])/(nrow(ped)* (ncol(ped)-6))) * 100,"%\n\n")

# --- Advice: Genotype Inference
cat("\tMethod sensitive to missing data, you are strongly recommended to use the genotype inference tool. \n\n\n")

# --- Check for Mendelian errors  --- --- --- --- --- --- --- --- --- --- --- 
  
plink_ = "plink"   #/!\ : option?
cat("--- Check Mendelian errors")
cmd = paste0("cp ",paste0(path_to_file, opt$pedfile)," check_mendel.ped ; cp ",paste0(path_to_file, opt$mapfile)," check_mendel.map")
system(cmd)
system(paste0(plink_ ," --file check_mendel --mendel --out sample_check > file.log"))
cat("\n")
system("grep 'errors detected' file.log")
cat("--")
system("grep genotyping file.log")
system("rm *check* file.log")

# --------------------------------
cat("\n\n--- Choose options to start analysis.. \n\n")

