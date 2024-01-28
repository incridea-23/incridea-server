/*
  Warnings:

  - The values [SUCCESS,FAILED] on the enum `LASubmission_isRight` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `fitbsubmission` ADD COLUMN `isAnswer` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `lasubmission` MODIFY `isRight` ENUM('PENDING', 'TRUE', 'FALSE') NOT NULL DEFAULT 'PENDING';
