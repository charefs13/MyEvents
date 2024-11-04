/*
  Warnings:

  - You are about to alter the column `siret` on the `Entreprise` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `cp` on the `Entreprise` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `Entreprise` MODIFY `siret` INTEGER NOT NULL,
    MODIFY `cp` INTEGER NOT NULL;
