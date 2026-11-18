-- AlterTable
ALTER TABLE `platform_settings` ADD COLUMN `academic_months_count` INTEGER NOT NULL DEFAULT 9,
    ADD COLUMN `academic_start_month` INTEGER NOT NULL DEFAULT 10;
