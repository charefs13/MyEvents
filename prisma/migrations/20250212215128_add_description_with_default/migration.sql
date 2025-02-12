/*
  Warnings:

  - Made the column `description` on table `Prestation` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Prestation` MODIFY `description` VARCHAR(191) NOT NULL;
