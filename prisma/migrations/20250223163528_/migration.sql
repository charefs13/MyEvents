/*
  Warnings:

  - Added the required column `clientGenre` to the `Devis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientMail` to the `Devis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientNom` to the `Devis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientPrenom` to the `Devis` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Devis` ADD COLUMN `clientGenre` VARCHAR(191) NOT NULL,
    ADD COLUMN `clientMail` VARCHAR(191) NOT NULL,
    ADD COLUMN `clientNom` VARCHAR(191) NOT NULL,
    ADD COLUMN `clientPrenom` VARCHAR(191) NOT NULL;
