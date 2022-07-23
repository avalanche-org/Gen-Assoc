#!/usr/bin/env Rscript

# --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---  
# Marieme TOP
# This is script to advise user on the validity of asymptotic test

# --- Requirements 
# Input     : ped, map files and selected markers given as arguments

# Exemple   :  Rscript validity_asympt_test.R --pedfile 25markers.ped --mapfile 25markers.map --markerset 1,2,3


# --- --- ---  Packages

# empty R environment
rm(list=ls())

# load required packages
library(optparse)
library(stringr)

# build argument parser
option_list = list(
  make_option(c("--pedfile"), type="character", help="basename of ped file", metavar="character"),
  make_option(c("--mapfile"), type="character", help="basename of map file", metavar="character"),
  make_option(c("--markerset"), type="character", help="markerset of analysis", metavar="character"))

opt_parser = OptionParser(option_list=option_list)
opt = parse_args(opt_parser) 

# Functions

get_maf <- function(marker){
  
  # --- maf calculation for autosomal gene
  # --- marker = column selected in ped file
  
  # Gene of interest
  marker = as.integer(marker)
  
  # genotypes for this gene in population
  geno_population <- ped[,(marker+6)]
  
  # remove missing values
  cat("\n--- Sample size: ",length(geno_population), " \n")
  cat("--- Marker: ",marker, " \n")
  for (genotype in 1:length(geno_population)) {
    if (isTRUE(geno_population[genotype] == "0 0")){
      geno_population = geno_population[-genotype]
    }  
  }
  cat("--- Removing missing genotypes.. ", length(ped[,(marker+6)]) - length(geno_population) ,
      "individuals removed. \n--- Maf calculation based on: ",length(geno_population), "genotypes \n")
  
  #genotype repartition 
  homozygous_1 = length(which(geno_population == "1 1"))
  homozygous_2 = length(which(geno_population == "2 2"))
  heterozygous_al = length(which(geno_population == "1 2"))
  
  # Method: The frequency of an allele in a population is calculated 
  #         by dividing the number of copies of that allele in the population 
  #         by the total number of alleles in the population.
  
  
  # Allele 1 : 
  all_1_count = (homozygous_1 * 2) + heterozygous_al
  # Allele 2 :
  all_2_count = (homozygous_2 * 2) + heterozygous_al
  # Total number of alleles : 
  tot_all = length(geno_population)* 2
  
  # Frequencies
    
    # Allele 1
  freq_all_1 = all_1_count / tot_all 
    
    # Allele 2
  freq_all_2 = all_2_count / tot_all 
  
  if (isTRUE(freq_all_1 < 0.5)){maf = freq_all_1} else {maf = freq_all_2}
  cat("--- Minor Allele Frequency for marker ", marker, " is : ", maf, "\n" )
  
  Alleles = c("Allele counts", "Allele frequencies")
  Allele_1 <- c(all_1_count,freq_all_1)
  Allele_2 <- c(all_2_count,freq_all_2)
  Total <- c(paste0(all_1_count+all_2_count,"/",tot_all), freq_all_1+freq_all_2)
  
  tab = knitr::kable(data.frame(Alleles,Allele_1,Allele_2, Total),digits = 3, align = "c", "rst")
  
  maf = round(maf, digits = 1)
  return(list(maf=maf,tab=tab))
}

# --------------------
# read files 
ped = read.delim(opt$pedfile, header = F , stringsAsFactors = F)
map = read.delim(opt$mapfile, header = F , stringsAsFactors = F)

#================================================================================================================

# --- Determine validity of asymptotic test --- --- --- --- --- --- --- --- ---  

cat("\n--- Suggestion for run")

# --- Variables

# Sample size
sample_size = nrow(ped)
ajusted_sample_size = (ceiling(sample_size/100) * 100)-100  
if(ajusted_sample_size==0){ajusted_sample_size=100}

# -- Minor allele frequency calculation (use function)
cat("\n--- Minor Allele Frequency Calculation : \n")
#Pour SM : calculer maf de chaque marqueur

if (is.null(opt$markerset)== TRUE){
  maf = 0
  markers= 1:(ncol(ped)-6)
  for (pos in markers){
    marker = pos
    maf = maf + get_maf(marker)$maf
  }
  cat("\n\n ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░\n")
  cat(paste("\n-- Average MAF for the", length(markers), "selected markers is :", maf/length(markers)))
  maf=maf/length(markers)
}



# -- MM : boucler sur markers

if (is.null(opt$markerset)== FALSE){
  maf = 0
  markers= unlist(str_split(opt$markerset,pattern = ","))
  for (pos in 1:length(markers)){
    marker = markers[pos]
    maf = maf + get_maf(marker)$maf
  }
  # additionner les differents maf et diviser par le nombre de marqueurs choisis to get maf moyen
  cat("\n\n ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░\n")
  cat(paste("\n-- Average MAF for the", length(markers), "selected markers is :", maf/length(markers),"\n"))
  maf = maf/length(markers)
}

# Ajust maf

ajusted_maf= round(maf, digits = 1)




# -- Cases where empirical = asymptotic (brute-force)

single_marker = add_2 = add_3 = epistasis = "Empirical"

# -- sample size 100, MAF variable 

if (isTRUE(ajusted_sample_size==100)){
  if (isTRUE(ajusted_maf <= 0.2)) {single_marker = add_2 = add_3 = "Theoretical"}
  if (isTRUE(ajusted_maf == 0.3)) {single_marker = add_2 = "Theoretical"}
  if (isTRUE(ajusted_maf == 0.4)) {single_marker = "Theoretical"}
}

# -- sample size between 200:300 or equal to 1000

if (isTRUE(ajusted_sample_size == 200) |isTRUE(ajusted_sample_size == 300) | isTRUE(ajusted_sample_size == 1000)){
  if (isTRUE(ajusted_maf <= 0.2)) {single_marker = add_2 = add_3 = "Theoretical"}
  if (isTRUE(ajusted_maf == 0.3)) {single_marker = "Theoretical"}
}

# -- sample size between 400:900  

if (isTRUE(ajusted_sample_size>=400) & isTRUE(ajusted_sample_size<=900)){
  if (isTRUE(ajusted_maf == 0.1)) {single_marker = add_2 = add_3 = "Theoretical"}
  if (isTRUE(ajusted_maf == 0.2)) {single_marker = add_2 = "Theoretical"}
  if (isTRUE(ajusted_maf == 0.3)) {single_marker = "Theoretical"}
}


# -- Display

cat("\n-- Sample size:",sample_size ,"\n")
cat("-- Minor Allele Frequency:",maf,"\n\n")

cat("--- For your data configuration, it is suggested to choose:\n")
cat("--- Depending on your model complexity:\n")

Complexity= c("Single-Marker","Additive Model with 2 markers","Additive Model with 3 markers","Epistasis Model")
Advice = c(single_marker,add_2,add_3,epistasis)
out = knitr::kable(data.frame(Complexity,Advice), align = "c", "rst")
print(out)




