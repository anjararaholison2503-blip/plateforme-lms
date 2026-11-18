-- CreateTable
CREATE TABLE `course_materials` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `course_id` INTEGER NOT NULL,
    `uploaded_by_id` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `type` ENUM('PDF', 'VIDEO', 'IMAGE', 'ZIP', 'DOCUMENT', 'LINK', 'OTHER') NOT NULL DEFAULT 'OTHER',
    `file_url` VARCHAR(191) NOT NULL,
    `file_name` VARCHAR(191) NOT NULL,
    `file_size` INTEGER NOT NULL,
    `mime_type` VARCHAR(191) NOT NULL,
    `visibility` ENUM('STUDENTS', 'TEACHERS', 'ALL', 'PRIVATE') NOT NULL DEFAULT 'STUDENTS',
    `published_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expires_at` DATETIME(3) NULL,
    `expiration_status` ENUM('ACTIVE', 'EXPIRING_SOON', 'PENDING_REVIEW', 'EXPIRED', 'EXTENDED', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `grace_period_ends_at` DATETIME(3) NULL,
    `expiration_notified_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `course_materials_course_id_idx`(`course_id`),
    INDEX `course_materials_uploaded_by_id_idx`(`uploaded_by_id`),
    INDEX `course_materials_expires_at_idx`(`expires_at`),
    INDEX `course_materials_expiration_status_idx`(`expiration_status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `type` ENUM('MATERIAL_EXPIRING', 'MATERIAL_EXPIRING_URGENT', 'MATERIAL_EXPIRED', 'MATERIAL_EXTENDED', 'MATERIAL_DELETED', 'COURSE_ANNOUNCEMENT', 'GRADE_PUBLISHED', 'ENROLLMENT', 'SYSTEM') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `data` JSON NULL,
    `channel` ENUM('IN_APP', 'EMAIL', 'SMS') NOT NULL DEFAULT 'IN_APP',
    `status` ENUM('PENDING', 'SENT', 'FAILED', 'READ') NOT NULL DEFAULT 'PENDING',
    `material_id` INTEGER NULL,
    `read_at` DATETIME(3) NULL,
    `sent_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_user_id_idx`(`user_id`),
    INDEX `notifications_status_idx`(`status`),
    INDEX `notifications_type_idx`(`type`),
    INDEX `notifications_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `course_materials` ADD CONSTRAINT `course_materials_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_materials` ADD CONSTRAINT `course_materials_uploaded_by_id_fkey` FOREIGN KEY (`uploaded_by_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_material_id_fkey` FOREIGN KEY (`material_id`) REFERENCES `course_materials`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
