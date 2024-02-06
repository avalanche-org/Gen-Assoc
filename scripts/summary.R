#!/usr/bin/env Rscript

#-------------------
#   Marieme Top @ topmaryem@gmail.com 

# Institut Pasteur Dakar| Epidemiology Clinical Research & Data Science Unit
#                         Bioinformatics team 
# H3ABioNet             | Tools & Web Services Work Package 
#                         Gen_Assoc Project
# --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---  
# This is code to generate summary statistics of your data   
# Advice for Running Genotype Inference 

# --- Requirements 
# Input     : ped, map and phen files given as arguments with no Mendelian errors

args = commandArgs(trailingOnly = TRUE) 

# --- Packages

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

# --- --- --- --- 
#   Functions
# --- --- --- ---

# -- [count the total number of nuclear families and trios]

Numb_trios<- function(dataset){
  trios= tibble()
  for (i in dataset$V2){
    trios= rbind(trios,dataset[dataset$V2 == i, c(2,3,4)])
  }
  trios = trios[-c(which(trios$V3 == 0)), ]  #remove founders
  return(nrow(unique(trios)))
}

Numb_nuclear_fam <- function(dataset){
  fam= tibble()
  for (i in dataset$V2){
    fam= rbind(fam,dataset[dataset$V2 == i, c(2,3,4)])
  }
  fam = fam[-c(which(fam$V3 == 0)), ]  #remove founders
  
  return(length(unique(paste0(fam$V3,fam$V4))))
}

# --- --- --- --- 
#   Libraries
# --- --- --- ---
library(optparse)
library(stringr)
library(descr)
suppressMessages(library(dplyr))

# --- --- --- --- --- 
#   Collect arguments
# --- --- --- --- ---
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

# --- --- --- --- --- 
#   Display results
# --- --- --- --- ---
cat("\n\n\n")
cat(" +-+-+-+-+-+-+-+  +-+-+-+-+-+-+-+-+-+-+
  S U M M A R Y    S T A T I S T I C S 
 +-+-+-+-+-+-+-+  +-+-+-+-+-+-+-+-+-+-+\n\n")

cat("   [•] Working directory:",getwd(),"\n",
    "  [•] Run started at: ",as.character(Sys.time()),"\n")
cat("\n\n")


# --- Read Files

ped = read.delim(paste0(path_to_file, opt$pedfile), header = F , stringsAsFactors = F)

map = read.delim(paste0(path_to_file, opt$mapfile), header = F , stringsAsFactors = F)
# if map file has only one column (might delete this later)
if(ncol(map)==1){map = read.delim(paste0(path_to_file, opt$mapfile), header = F , stringsAsFactors = F, sep = " ")}

phen = read.delim(paste0(path_to_file, opt$phenfile), header = F , stringsAsFactors = F)
if(ncol(phen)==1){phen = read.delim(paste0(path_to_file, opt$phenfile), header = F , stringsAsFactors = F, sep = " ")}


# ---   SUMMARY STATISTICS  ---

cat("   [•] Files selected: \n")
cat("\t", opt$pedfile,"\n\t", opt$mapfile,"\n\t", opt$phenfile,"\n\n")


#create descriptive matrix
data_descript <- matrix(c(length(unique(ped$V1)),length(which(ped$V3 == 0)),  # Fam, Founders
                          Numb_nuclear_fam(ped),Numb_trios(ped),nrow(ped),  # NucFam, trios, individuals
                          length(which(ped$V5== "1")), length(which(ped$V5== "2")), # gender
                          nrow(map)), ncol=1) # markers

#specify row and column names of matrix
rownames(data_descript) <- c("Families","Founders","Nuclear Families","Trios","Individuals","Males","Females","Markers")
colnames(data_descript) <- c('Count')
data_descript <- as.table(data_descript)

cat("____\n\n")
cat("   [•] DATA DESCRIPTION \n")
data_descript
cat("\n____\n\n")


cat("   [•] PHENOTYPE DESCRIPTION \n\n")

cat("\t",(ncol(phen)-2)," phenotype(s) detected in ",opt$phenfile,"\n\n")

phenotypes = colnames(phen)[3:ncol(phen)]
i= 1; count = 0

for (i in 1:length(phenotypes)){  # Parcourir les phenotypes
  
  # Phenotype name
  pheno = phenotypes[i]   
  pheno_value = phen[1, pheno]    # use first value to determine if quantitative or categorial  
  
  # 
  if(isFALSE(pheno_value%%1==0) && isTRUE(pheno_value!=0)){count = count + 1}
  
  # Display
  cat("\t Phenotype ",phenotypes[i], " : ")
  
  if(count>=1){
    cat(" Quantitative      ------\n\n")
    cat("\t",descr(phen[,phenotypes[i]]))
  }
  if (count==0){
    cat(" Categorial      ------\n\n")
    cat(" Levels:\t", sort(unique(phen[,phenotypes[i]])),"\n Counts:\t", table(phen[,phenotypes[i]]),"\n")
  }
  
  cat("\n")
  count = 0
}
suppressMessages(rm(phenotypes,i))

cat("____\n\n")

cat("   [•] MISSING GENOTYPES \n \n")
cat("\tAlert on missing values !!! \n")
cat("\tMethod sensitive to missing data. \n")
cat("\tif you have any it is recommended to use the genotype inference option. \n\n")


cat("\tThere is", length(ped[ped == '0 0']), "missing genotypes for a total of",nrow(ped)* (ncol(ped)-6),"genotypes\n")
cat("\t+++++++++++++++++++++++++++++++++++++++\n")
cat("\t+++ Percentage of missing values (%):", round(100* (length(ped[ped == '0 0']))/(nrow(ped)*(ncol(ped)-6)),2),"\n\n")
cat("\n\n\n")
