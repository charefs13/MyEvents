-- DropForeignKey
ALTER TABLE `Invite` DROP FOREIGN KEY `Invite_evenementId_fkey`;

-- AddForeignKey
ALTER TABLE `Invite` ADD CONSTRAINT `Invite_evenementId_fkey` FOREIGN KEY (`evenementId`) REFERENCES `Evenement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
