-- AlterTable
ALTER TABLE `Devis` ADD COLUMN `declineMsg` VARCHAR(191) NULL,
    ADD COLUMN `isDecline` BOOLEAN NOT NULL DEFAULT false;
