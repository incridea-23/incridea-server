/*
  Warnings:

  - Added the required column `endTime` to the `Quiz` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Quiz` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `quiz` ADD COLUMN `endTime` DATETIME(3) NOT NULL,
    ADD COLUMN `startTime` DATETIME(3) NOT NULL;
