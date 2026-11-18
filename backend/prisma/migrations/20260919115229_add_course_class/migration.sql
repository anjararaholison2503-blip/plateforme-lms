-- CreateTable
CREATE TABLE `course_classes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `course_id` INTEGER NOT NULL,
    `class_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `course_classes_course_id_idx`(`course_id`),
    INDEX `course_classes_class_id_idx`(`class_id`),
    UNIQUE INDEX `course_classes_course_id_class_id_key`(`course_id`, `class_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `course_classes` ADD CONSTRAINT `course_classes_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_classes` ADD CONSTRAINT `course_classes_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `institution_units`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
