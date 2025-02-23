-- DropForeignKey
ALTER TABLE `Devis` DROP FOREIGN KEY `Devis_entrepriseId_fkey`;

-- DropForeignKey
ALTER TABLE `Devis` DROP FOREIGN KEY `Devis_evenementId_fkey`;

-- DropForeignKey
ALTER TABLE `PrestationDevis` DROP FOREIGN KEY `PrestationDevis_Devis_fkey`;

-- DropForeignKey
ALTER TABLE `PrestationDevis` DROP FOREIGN KEY `PrestationDevis_Prestation_fkey`;

-- AddForeignKey
ALTER TABLE `Devis` ADD CONSTRAINT `Devis_evenementId_fkey` FOREIGN KEY (`evenementId`) REFERENCES `Evenement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Devis` ADD CONSTRAINT `Devis_entrepriseId_fkey` FOREIGN KEY (`entrepriseId`) REFERENCES `Entreprise`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PrestationDevis` ADD CONSTRAINT `PrestationDevis_Prestation_fkey` FOREIGN KEY (`prestationId`) REFERENCES `Prestation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PrestationDevis` ADD CONSTRAINT `PrestationDevis_Devis_fkey` FOREIGN KEY (`devisId`) REFERENCES `Devis`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
