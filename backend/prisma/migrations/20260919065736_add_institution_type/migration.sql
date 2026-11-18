-- AlterTable
ALTER TABLE `platform_settings` ADD COLUMN `custom_labels` JSON NULL,
    ADD COLUMN `hierarchy_model` JSON NULL,
    ADD COLUMN `institution_type` ENUM('UNIVERSITY', 'HIGH_SCHOOL', 'MIDDLE_SCHOOL', 'CUSTOM') NOT NULL DEFAULT 'UNIVERSITY',
    ADD COLUMN `onboarding_done` BOOLEAN NOT NULL DEFAULT false;
