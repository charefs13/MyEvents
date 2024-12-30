/*
  Warnings:

  - You are about to drop the column `listeId` on the `Invite` table. All the data in the column will be lost.
  - Added the required column `evenementId` to the `Invite` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Invite` DROP FOREIGN KEY `Invite_listeId_fkey`;

-- AlterTable
ALTER TABLE `Invite` DROP COLUMN `listeId`,
    ADD COLUMN `evenementId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Invite` ADD CONSTRAINT `Invite_evenementId_fkey` FOREIGN KEY (`evenementId`) REFERENCES `Evenement`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
