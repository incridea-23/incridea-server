/*
  Warnings:

  - Added the required column `questionType` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `question` ADD COLUMN `questionType` ENUM('MCQ', 'FITB', 'LA') NOT NULL;

-- CreateTable
CREATE TABLE `LASubmission` (
    `id` VARCHAR(191) NOT NULL,
    `teamId` INTEGER NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `isRight` ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `LASubmission_teamId_idx`(`teamId`),
    INDEX `LASubmission_questionId_idx`(`questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
