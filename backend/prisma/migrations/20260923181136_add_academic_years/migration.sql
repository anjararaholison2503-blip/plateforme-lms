-- AlterTable
ALTER TABLE `invoices` ADD COLUMN `academic_year_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `student_enrollments` ADD COLUMN `academic_year_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `academic_years` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(191) NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `status` ENUM('PLANNED', 'ACTIVE', 'CLOSED', 'ARCHIVED') NOT NULL DEFAULT 'PLANNED',
    `description` TEXT NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `has_semesters` BOOLEAN NOT NULL DEFAULT false,
    `semester_1_start` DATETIME(3) NULL,
    `semester_1_end` DATETIME(3) NULL,
    `semester_2_start` DATETIME(3) NULL,
    `semester_2_end` DATETIME(3) NULL,
    `registration_open_date` DATETIME(3) NULL,
    `registration_close_date` DATETIME(3) NULL,
    `reenrollment_deadline` DATETIME(3) NULL,
    `created_by_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `academic_years_label_key`(`label`),
    INDEX `academic_years_status_idx`(`status`),
    INDEX `academic_years_label_idx`(`label`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_academic_year_id_fkey` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_enrollments` ADD CONSTRAINT `student_enrollments_academic_year_id_fkey` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `academic_years` ADD CONSTRAINT `academic_years_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
