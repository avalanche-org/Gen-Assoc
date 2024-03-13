#!/usr/bin/env Rscript

#-------------------
#   Marieme Top @ topmaryem@gmail.com 

# Institut Pasteur Dakar| Epidemiology Clinical Research & Data Science Unit
#                         Bioinformatics team 
# H3ABioNet             | Tools & Web Services Work Package 
#                         Gen_Assoc Project
# --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- 
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

#======================================================
#         Functions
#======================================================

# The permutations performed for an empirical analysis can be resource and time consuming. 
# In order to save computational power and reduce program execution time, 
# we compared the distributions of the asymptotic and empirical run by changing the following parameters:
# MAF
# Frequency of the minor allele
# Sample Size

get_maf <- function(marker){
  
  # - maf calculation for autosomal gene
  # - marker = marker selected in markerset or position-6
  
  # Gene of interest
  marker = as.integer(marker)
  # genotypes for this gene in population
  geno_population <-as.data.frame(ped[,marker+6])
  
  #cat("--- Marker: ",marker, " \n")
  
  # Remove missing genotypes for allele count
  missing = which(geno_population$`ped[, marker + 6]` == "0 0")
  
  if (isTRUE(length(missing) != 0)){  # FALSE if missing values exist
    geno_population <- geno_population[-missing,]
    #test : length(missing)+length(geno_population)
  } else {
    geno_population = geno_population[,]
  }
  
  #genotype repartition 
  homozygous_1 = length(which(geno_population == "1 1"))
  homozygous_2 = length(which(geno_population == "2 2"))
  heterozygous_al = length(which(geno_population == "1 2"))
  # test : homozygous_1+homozygous_2+heterozygous_al+ length(which(geno_population == "0 0"))
  
  # Method: The frequency of an allele in a population is calculated 
  #         by dividing the number of copies of that allele in the population 
  #         by the total number of alleles in the population.
  
  # Allele 1 : 
  all_1_count = (homozygous_1 * 2) + heterozygous_al
  # Allele 2 :
  all_2_count = (homozygous_2 * 2) + heterozygous_al
  # Total number of alleles : 
  tot_all = length(geno_population)* 2
  # test : all_1_count + all_2_count

  # Frequencies
  # Allele 1
  freq_all_1 = all_1_count / tot_all 
  # Allele 2
  freq_all_2 = all_2_count / tot_all 
  # test = freq_all_1+freq_all_2
  
  # MAF value 
  
  if (isTRUE(freq_all_1 < 0.5)){maf = freq_all_1} else {maf = freq_all_2}
  
  cat("--- maf for marker ", marker, " is : ", maf, "\n" )
  Alleles = c("Allele counts", "Allele frequencies")
  Allele_1 <- c(all_1_count,freq_all_1)
  Allele_2 <- c(all_2_count,freq_all_2)
  Total <- c(paste0(all_1_count+all_2_count,"/",tot_all), freq_all_1+freq_all_2)
  
  tab = knitr::kable(data.frame(Alleles,Allele_1,Allele_2, Total),digits = 3, align = "c", "rst")
  maf = round(maf, digits = 1)
  return(list(maf=maf,tab=tab))
}

#=============  I N P U T  ======================

# read files 
ped = read.delim(opt$pedfile, header = F , stringsAsFactors = F)
map = read.delim(opt$mapfile, header = F , stringsAsFactors = F)


#========  MINOR ALLELE FREQ  =========================

# MAF_table to store snp and maf info
snp_list = maf_list = NULL

# /!\Point de correction

# if (is.null(opt$markerset) == TRUE){ # single marker case, calculate maf of each market
#   cat("-- Single-Marker Selected :")
#   markers=7:ncol(ped)-6
#   cat(paste0("  Marker 1 to ", length(markers) ," \n"))

if (isTRUE(is.null(opt$markerset) | isTRUE(opt$markerset == 0))){ # single marker case, calculate maf of each marker
  #cat("-- Single-Marker Selected :")
  markers=7:ncol(ped)-6
  #cat(paste0("  Marker 1 to ", length(markers) ," \n"))
  
}else{ # multi marker case, calculate maf of those markers
  #cat("-- Multi-marker Selected :")
  markers = as.integer(unlist(str_split(opt$markerset,",")))
  #cat(paste0(length(markers),"  Markers selected \n"))
}

# test 
#print(markers)

# Parcourir snps and get maf
cat("\t   Minor Allele Frequency Calculation \n")  
cat("================================\n")  

for (snp in markers){
  snp_list = c(snp_list, map$V2[snp])
  maf_tab= get_maf(snp)
  maf_list = c(maf_list,maf_tab$maf)
}

# Once we have our snp and maf lists => MAF_table
MAF_table = as.data.frame(cbind(snp_list,maf_list))
# Final MAF
maf=mean(maf_list)
# Ajust
ajusted_maf= round(mean(maf_list), digits = 1)


#========  SAMPLE SIZE  =========================

# Sample size
sample_size = nrow(ped)

# Ajuste it to fit the simulations
ajusted_sample_size = (ceiling(sample_size/100) * 100)-100  
if(ajusted_sample_size==0){ajusted_sample_size=100} # correction pour n < 100 

#======================  HEAT MAP CODE  =========================
#================================================================
# Model Complexity
# The following heat map was generated, 
# allowing to visualise under which conditions an asymptotic run is equivalent to the empirical run.
# Thus, depending on these same parameters, you will be advised to do an asymptotic run if it is equivalent to the empirical run.

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

#================================================================
#================================================================

cat("\n\n +-+-+-+-+-+-+-+-+-+-+-+-+
    P A R A M E T E R S 
 +-+-+-+-+-+-+-+-+-+-+-+-+\n\n")

cat("-- Sample size:",sample_size,"\n")
cat("-- Ajusted sample size:",ajusted_sample_size ,"\n\n")

cat("-- Mean Minor Allele Frequency:",maf,"\n")
cat("-- Adjusted Minor Allele Frequency:",ajusted_maf,"\n\n")

#======

cat("--- For your data configuration, it is suggested to choose:\n\n")

Complexity= c("Single-Marker","Additive Model with 2 markers","Additive Model with 3 markers","Epistasis Model")
Advice = c(single_marker,add_2,add_3,epistasis)

# write.csv(as.table(cbind(Complexity,Advice)),file = "Advise.txt", quote = FALSE, row.names = FALSE)
write(knitr::kable(cbind(Complexity,Advice), align = "c", "rst"), "validity_asympt_theory_advice.txt")

system("cat validity_asympt_theory_advice.txt ")

