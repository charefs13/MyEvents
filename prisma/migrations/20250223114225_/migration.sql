/*
  Warnings:

  - Added the required column `raisonSociale` to the `Devis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `typeEntreprise` to the `Devis` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Devis` ADD COLUMN `raisonSociale` VARCHAR(191) NOT NULL,
    ADD COLUMN `typeEntreprise` VARCHAR(191) NOT NULL;
