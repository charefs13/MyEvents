/*
  Warnings:

  - Added the required column `dateDebut` to the `Devis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateFin` to the `Devis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `typeEvenement` to the `Devis` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Devis` ADD COLUMN `dateDebut` DATETIME(3) NOT NULL,
    ADD COLUMN `dateFin` DATETIME(3) NOT NULL,
    ADD COLUMN `typeEvenement` VARCHAR(191) NOT NULL;
