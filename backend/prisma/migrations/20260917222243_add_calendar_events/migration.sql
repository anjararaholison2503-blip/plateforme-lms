-- CreateTable
CREATE TABLE `calendar_events` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `type` ENUM('COURSE', 'EXAM', 'HOLIDAY', 'MEETING', 'DEADLINE', 'OTHER') NOT NULL DEFAULT 'OTHER',
    `visibility` ENUM('PUBLIC', 'PRIVATE', 'UNIT') NOT NULL DEFAULT 'PUBLIC',
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `all_day` BOOLEAN NOT NULL DEFAULT false,
    `location` VARCHAR(191) NULL,
    `color` VARCHAR(191) NULL DEFAULT '#3B82F6',
    `unit_id` INTEGER NULL,
    `created_by_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `calendar_events_start_date_idx`(`start_date`),
    INDEX `calendar_events_unit_id_idx`(`unit_id`),
    INDEX `calendar_events_created_by_id_idx`(`created_by_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `calendar_events` ADD CONSTRAINT `calendar_events_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `institution_units`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `calendar_events` ADD CONSTRAINT `calendar_events_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
