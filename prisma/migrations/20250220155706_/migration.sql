/*
  Warnings:

  - Added the required column `prix` to the `PrestationDevis` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `PrestationDevis` ADD COLUMN `prix` DOUBLE NOT NULL;
