-- CreateTable
CREATE TABLE `assignments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `course_id` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `instructions` TEXT NOT NULL,
    `published_at` DATETIME(3) NULL,
    `due_date` DATETIME(3) NOT NULL,
    `max_score` INTEGER NOT NULL DEFAULT 20,
    `attachment_url` VARCHAR(191) NULL,
    `attachment_name` VARCHAR(191) NULL,
    `attachment_size` INTEGER NULL,
    `allow_late_submission` BOOLEAN NOT NULL DEFAULT true,
    `allow_resubmission` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `created_by_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `assignments_course_id_idx`(`course_id`),
    INDEX `assignments_status_idx`(`status`),
    INDEX `assignments_due_date_idx`(`due_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assignment_submissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assignment_id` INTEGER NOT NULL,
    `student_id` INTEGER NOT NULL,
    `content` TEXT NULL,
    `file_url` VARCHAR(191) NULL,
    `file_name` VARCHAR(191) NULL,
    `file_size` INTEGER NULL,
    `mime_type` VARCHAR(191) NULL,
    `submitted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_late` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('SUBMITTED', 'GRADED', 'RETURNED', 'RESUBMITTED') NOT NULL DEFAULT 'SUBMITTED',
    `score` DECIMAL(5, 2) NULL,
    `feedback` TEXT NULL,
    `graded_at` DATETIME(3) NULL,
    `graded_by_id` INTEGER NULL,
    `returned_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `assignment_submissions_assignment_id_idx`(`assignment_id`),
    INDEX `assignment_submissions_student_id_idx`(`student_id`),
    INDEX `assignment_submissions_status_idx`(`status`),
    UNIQUE INDEX `assignment_submissions_assignment_id_student_id_key`(`assignment_id`, `student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `assignments` ADD CONSTRAINT `assignments_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assignments` ADD CONSTRAINT `assignments_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assignment_submissions` ADD CONSTRAINT `assignment_submissions_assignment_id_fkey` FOREIGN KEY (`assignment_id`) REFERENCES `assignments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assignment_submissions` ADD CONSTRAINT `assignment_submissions_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assignment_submissions` ADD CONSTRAINT `assignment_submissions_graded_by_id_fkey` FOREIGN KEY (`graded_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
