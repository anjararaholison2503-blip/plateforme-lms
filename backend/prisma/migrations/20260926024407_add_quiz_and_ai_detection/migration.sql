-- AlterTable
ALTER TABLE `assignment_submissions` ADD COLUMN `ai_detection_details` JSON NULL,
    ADD COLUMN `ai_detection_score` DOUBLE NULL,
    ADD COLUMN `ai_detection_status` VARCHAR(191) NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE `quizzes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `course_id` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `duration` INTEGER NOT NULL DEFAULT 30,
    `max_attempts` INTEGER NOT NULL DEFAULT 1,
    `passing_score` INTEGER NOT NULL DEFAULT 10,
    `shuffle_questions` BOOLEAN NOT NULL DEFAULT true,
    `shuffle_answers` BOOLEAN NOT NULL DEFAULT true,
    `detect_tab_switch` BOOLEAN NOT NULL DEFAULT true,
    `max_tab_switches` INTEGER NOT NULL DEFAULT 3,
    `source_file_url` VARCHAR(191) NULL,
    `source_file_name` VARCHAR(191) NULL,
    `ai_generated` BOOLEAN NOT NULL DEFAULT false,
    `ai_generation_status` VARCHAR(191) NULL DEFAULT 'PENDING',
    `status` ENUM('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `created_by_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `quizzes_course_id_idx`(`course_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quiz_questions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quiz_id` INTEGER NOT NULL,
    `question` TEXT NOT NULL,
    `type` ENUM('MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'FILL_IN_BLANK') NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    `options` JSON NULL,
    `correct_answer` TEXT NULL,
    `explanation` TEXT NULL,
    `points` INTEGER NOT NULL DEFAULT 1,
    `difficulty` VARCHAR(191) NULL DEFAULT 'MEDIUM',
    `order_index` INTEGER NOT NULL DEFAULT 0,

    INDEX `quiz_questions_quiz_id_idx`(`quiz_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quiz_attempts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quiz_id` INTEGER NOT NULL,
    `student_id` INTEGER NOT NULL,
    `tab_switch_count` INTEGER NOT NULL DEFAULT 0,
    `warnings` JSON NULL,
    `is_flagged` BOOLEAN NOT NULL DEFAULT false,
    `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `submitted_at` DATETIME(3) NULL,
    `score` DECIMAL(5, 2) NULL,
    `status` ENUM('IN_PROGRESS', 'SUBMITTED', 'GRADED', 'TIMEOUT', 'ABANDONED') NOT NULL DEFAULT 'IN_PROGRESS',

    INDEX `quiz_attempts_quiz_id_idx`(`quiz_id`),
    INDEX `quiz_attempts_student_id_idx`(`student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quiz_answers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `attempt_id` INTEGER NOT NULL,
    `question_id` INTEGER NOT NULL,
    `answer` TEXT NULL,
    `is_correct` BOOLEAN NULL,
    `points_earned` DECIMAL(5, 2) NULL,

    UNIQUE INDEX `quiz_answers_attempt_id_question_id_key`(`attempt_id`, `question_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `quizzes` ADD CONSTRAINT `quizzes_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quizzes` ADD CONSTRAINT `quizzes_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_questions` ADD CONSTRAINT `quiz_questions_quiz_id_fkey` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_attempts` ADD CONSTRAINT `quiz_attempts_quiz_id_fkey` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_attempts` ADD CONSTRAINT `quiz_attempts_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_answers` ADD CONSTRAINT `quiz_answers_attempt_id_fkey` FOREIGN KEY (`attempt_id`) REFERENCES `quiz_attempts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_answers` ADD CONSTRAINT `quiz_answers_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
