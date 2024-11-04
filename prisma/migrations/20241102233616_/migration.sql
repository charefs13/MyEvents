/*
  Warnings:

  - You are about to alter the column `siret` on the `Entreprise` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `BigInt`.

*/
-- AlterTable
ALTER TABLE `Entreprise` MODIFY `siret` BIGINT NOT NULL;
