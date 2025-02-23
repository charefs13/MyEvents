/*
  Warnings:

  - Added the required column `total` to the `Devis` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Devis` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `total` INTEGER NOT NULL;
