/*
  Warnings:

  - You are about to drop the `Liste` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ListeItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Entreprise` DROP FOREIGN KEY `Entreprise_utilisateurId_fkey`;

-- DropForeignKey
ALTER TABLE `Evenement` DROP FOREIGN KEY `Evenement_utilisateurId_fkey`;

-- DropForeignKey
ALTER TABLE `Liste` DROP FOREIGN KEY `Liste_evenementId_fkey`;

-- DropForeignKey
ALTER TABLE `ListeItem` DROP FOREIGN KEY `ListeItem_listeId_fkey`;

-- DropTable
DROP TABLE `Liste`;

-- DropTable
DROP TABLE `ListeItem`;

-- AddForeignKey
ALTER TABLE `Entreprise` ADD CONSTRAINT `Entreprise_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `Utilisateur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evenement` ADD CONSTRAINT `Evenement_utilisateurId_fkey` FOREIGN KEY (`utilisateurId`) REFERENCES `Utilisateur`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
