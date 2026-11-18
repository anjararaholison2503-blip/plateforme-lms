/*
  Warnings:

  - A unique constraint covering the columns `[matricule]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `users` ADD COLUMN `matricule` VARCHAR(30) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_matricule_key` ON `users`(`matricule`);

-- CreateIndex
CREATE INDEX `users_matricule_idx` ON `users`(`matricule`);
