-- AlterTable
ALTER TABLE `courses` ADD COLUMN `coefficient` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `teaching_unit_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `teaching_units` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `semester` ENUM('S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10') NULL,
    `unit_id` INTEGER NULL,
    `created_by_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `teaching_units_code_key`(`code`),
    INDEX `teaching_units_unit_id_idx`(`unit_id`),
    INDEX `teaching_units_semester_idx`(`semester`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teaching_unit_classes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `teaching_unit_id` INTEGER NOT NULL,
    `class_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `teaching_unit_classes_teaching_unit_id_idx`(`teaching_unit_id`),
    INDEX `teaching_unit_classes_class_id_idx`(`class_id`),
    UNIQUE INDEX `teaching_unit_classes_teaching_unit_id_class_id_key`(`teaching_unit_id`, `class_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `courses_teaching_unit_id_idx` ON `courses`(`teaching_unit_id`);

-- AddForeignKey
ALTER TABLE `courses` ADD CONSTRAINT `courses_teaching_unit_id_fkey` FOREIGN KEY (`teaching_unit_id`) REFERENCES `teaching_units`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teaching_units` ADD CONSTRAINT `teaching_units_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `institution_units`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teaching_units` ADD CONSTRAINT `teaching_units_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teaching_unit_classes` ADD CONSTRAINT `teaching_unit_classes_teaching_unit_id_fkey` FOREIGN KEY (`teaching_unit_id`) REFERENCES `teaching_units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teaching_unit_classes` ADD CONSTRAINT `teaching_unit_classes_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `institution_units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
