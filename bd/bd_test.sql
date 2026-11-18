-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mer. 11 nov. 2026 à 17:32
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `lms_db`
--
CREATE DATABASE IF NOT EXISTS `lms_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `lms_db`;

-- --------------------------------------------------------

--
-- Structure de la table `academic_years`
--

CREATE TABLE `academic_years` (
  `id` int(11) NOT NULL,
  `label` varchar(191) NOT NULL,
  `start_date` datetime(3) NOT NULL,
  `end_date` datetime(3) NOT NULL,
  `status` enum('PLANNED','ACTIVE','CLOSED','ARCHIVED') NOT NULL DEFAULT 'PLANNED',
  `description` text DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `has_semesters` tinyint(1) NOT NULL DEFAULT 0,
  `semester_1_start` datetime(3) DEFAULT NULL,
  `semester_1_end` datetime(3) DEFAULT NULL,
  `semester_2_start` datetime(3) DEFAULT NULL,
  `semester_2_end` datetime(3) DEFAULT NULL,
  `registration_open_date` datetime(3) DEFAULT NULL,
  `registration_close_date` datetime(3) DEFAULT NULL,
  `reenrollment_deadline` datetime(3) DEFAULT NULL,
  `created_by_id` int(11) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `academic_years`
--

INSERT INTO `academic_years` (`id`, `label`, `start_date`, `end_date`, `status`, `description`, `is_default`, `has_semesters`, `semester_1_start`, `semester_1_end`, `semester_2_start`, `semester_2_end`, `registration_open_date`, `registration_close_date`, `reenrollment_deadline`, `created_by_id`, `created_at`, `updated_at`) VALUES
(1, '2026-2027', '2026-11-02 00:00:00.000', '2027-08-19 00:00:00.000', 'ACTIVE', NULL, 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-09-23 18:30:42.547', '2026-09-23 18:30:42.547');

-- --------------------------------------------------------

--
-- Structure de la table `assignments`
--

CREATE TABLE `assignments` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `title` varchar(191) NOT NULL,
  `instructions` text NOT NULL,
  `published_at` datetime(3) DEFAULT NULL,
  `due_date` datetime(3) NOT NULL,
  `max_score` int(11) NOT NULL DEFAULT 20,
  `attachment_url` varchar(191) DEFAULT NULL,
  `attachment_name` varchar(191) DEFAULT NULL,
  `attachment_size` int(11) DEFAULT NULL,
  `allow_late_submission` tinyint(1) NOT NULL DEFAULT 1,
  `allow_resubmission` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('DRAFT','PUBLISHED','CLOSED','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  `created_by_id` int(11) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `assignments`
--

INSERT INTO `assignments` (`id`, `course_id`, `title`, `instructions`, `published_at`, `due_date`, `max_score`, `attachment_url`, `attachment_name`, `attachment_size`, `allow_late_submission`, `allow_resubmission`, `status`, `created_by_id`, `created_at`, `updated_at`) VALUES
(2, 11, 'boucle', 'créer une fonction qui fait compté de 1 à 10 en utiliser boucle for', '2026-09-26 03:22:54.638', '2026-10-03 00:21:00.000', 20, NULL, NULL, NULL, 1, 0, 'PUBLISHED', 11, '2026-09-26 03:22:54.647', '2026-09-26 03:22:54.647'),
(3, 11, 'definition', 'Qu\'est-ce qu\'un constructeur (__construct) dans une classe PHP et à quoi sert-il ?', '2026-09-26 04:05:42.901', '2026-10-02 22:05:00.000', 20, NULL, NULL, NULL, 1, 0, 'PUBLISHED', 11, '2026-09-26 04:05:42.902', '2026-09-26 04:56:07.394'),
(4, 11, 'devoir', 'créer une fonction qui fait compté de 1 à 10 en utiliser boucle for', '2026-09-26 04:58:06.744', '2026-10-02 19:56:00.000', 20, NULL, NULL, NULL, 1, 1, 'PUBLISHED', 11, '2026-09-26 04:56:30.275', '2026-09-26 04:58:06.746'),
(5, 11, 'examen', 'examen', '2026-10-10 08:07:57.734', '2026-10-17 05:07:00.000', 20, '/uploads/assignments/2026-10/qcm_php_25_questions-1791619653980-466810150.pdf', 'qcm_php_25_questions.pdf', 7297, 1, 1, 'PUBLISHED', 11, '2026-10-10 08:07:57.737', '2026-10-10 08:07:57.737');

-- --------------------------------------------------------

--
-- Structure de la table `assignment_submissions`
--

CREATE TABLE `assignment_submissions` (
  `id` int(11) NOT NULL,
  `assignment_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `content` text DEFAULT NULL,
  `file_url` varchar(191) DEFAULT NULL,
  `file_name` varchar(191) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `mime_type` varchar(191) DEFAULT NULL,
  `submitted_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `is_late` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('SUBMITTED','GRADED','RETURNED','RESUBMITTED') NOT NULL DEFAULT 'SUBMITTED',
  `score` decimal(5,2) DEFAULT NULL,
  `feedback` text DEFAULT NULL,
  `graded_at` datetime(3) DEFAULT NULL,
  `graded_by_id` int(11) DEFAULT NULL,
  `returned_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `ai_detection_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`ai_detection_details`)),
  `ai_detection_score` double DEFAULT NULL,
  `ai_detection_status` varchar(191) DEFAULT 'PENDING'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `assignment_submissions`
--

INSERT INTO `assignment_submissions` (`id`, `assignment_id`, `student_id`, `content`, `file_url`, `file_name`, `file_size`, `mime_type`, `submitted_at`, `is_late`, `status`, `score`, `feedback`, `graded_at`, `graded_by_id`, `returned_at`, `created_at`, `updated_at`, `ai_detection_details`, `ai_detection_score`, `ai_detection_status`) VALUES
(2, 2, 12, '<?php\nfunction compterJusquaDix() {\n    for ($i = 1; $i <= 10; $i++) {\n        echo $i . \"<br>\"; // Utilisez \"\\n\" à la place de \"<br>\" si vous l\'exécutez dans un terminal\n    }\n}\n\n// Appel de la fonction\ncompterJusquaDix();\n?>\n', NULL, NULL, NULL, NULL, '2026-09-26 03:24:52.669', 0, 'GRADED', 12.00, NULL, '2026-09-26 03:55:55.064', 11, NULL, '2026-09-26 03:24:52.669', '2026-09-26 03:55:55.069', NULL, NULL, 'PENDING'),
(3, 3, 12, NULL, '/uploads/assignments/2026-09/En_PHP__un_constructeur____construc-1790395702262-586131473.txt', 'En PHP, un constructeur (__construc.txt', 338, 'text/plain', '2026-09-26 04:08:22.341', 0, 'SUBMITTED', NULL, NULL, NULL, NULL, NULL, '2026-09-26 04:08:22.341', '2026-09-26 04:46:21.829', '{\"mode\":\"SIMULATION\",\"analyzedAt\":\"2026-09-26T04:46:21.816Z\",\"wordCount\":49,\"passages\":[{\"paragraphIndex\":1,\"preview\":\"\\nEn PHP, un constructeur (__construct) est une méthode magique qui s\'exécute automatiquement dès que vous créez une nouvelle instance (un objet) d\'une...\",\"score\":0}],\"disclaimer\":\"Ce score est un INDICATEUR, pas une preuve. L\'enseignant garde le contrôle final.\"}', 8, 'COMPLETED'),
(4, 4, 12, NULL, '/uploads/assignments/2026-09/En_PHP__un_constructeur____construc-1790398727078-935979389.txt', 'En PHP, un constructeur (__construc.txt', 338, 'text/plain', '2026-09-26 04:58:47.150', 0, 'GRADED', 0.00, NULL, '2026-09-26 05:05:36.425', 11, NULL, '2026-09-26 04:58:47.150', '2026-09-26 05:05:36.434', '{\"mode\":\"SIMULATION\",\"analyzedAt\":\"2026-09-26T04:58:47.367Z\",\"wordCount\":49,\"passages\":[{\"paragraphIndex\":1,\"preview\":\"\\nEn PHP, un constructeur (__construct) est une méthode magique qui s\'exécute automatiquement dès que vous créez une nouvelle instance (un objet) d\'une...\",\"score\":77}],\"disclaimer\":\"Ce score est un INDICATEUR, pas une preuve. L\'enseignant garde le contrôle final.\"}', 78, 'COMPLETED');

-- --------------------------------------------------------

--
-- Structure de la table `calendar_events`
--

CREATE TABLE `calendar_events` (
  `id` int(11) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('COURSE','EXAM','HOLIDAY','MEETING','DEADLINE','OTHER') NOT NULL DEFAULT 'OTHER',
  `visibility` enum('PUBLIC','PRIVATE','UNIT') NOT NULL DEFAULT 'PUBLIC',
  `start_date` datetime(3) NOT NULL,
  `end_date` datetime(3) NOT NULL,
  `all_day` tinyint(1) NOT NULL DEFAULT 0,
  `location` varchar(191) DEFAULT NULL,
  `color` varchar(191) DEFAULT '#3B82F6',
  `unit_id` int(11) DEFAULT NULL,
  `created_by_id` int(11) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `calendar_events`
--

INSERT INTO `calendar_events` (`id`, `title`, `description`, `type`, `visibility`, `start_date`, `end_date`, `all_day`, `location`, `color`, `unit_id`, `created_by_id`, `created_at`, `updated_at`) VALUES
(2, 'Test Event', NULL, 'MEETING', 'PUBLIC', '2026-09-20 18:13:31.000', '2026-09-20 18:13:31.000', 0, NULL, '#3B82F6', NULL, 1, '2026-09-19 15:13:31.375', '2026-09-19 15:13:31.375'),
(5, 'Test Event', NULL, 'MEETING', 'PUBLIC', '2026-09-20 18:29:45.000', '2026-09-20 18:29:45.000', 0, NULL, '#3B82F6', NULL, 1, '2026-09-19 15:29:45.293', '2026-09-19 15:29:45.293'),
(7, 'Test Event', NULL, 'MEETING', 'PUBLIC', '2026-09-20 18:39:30.000', '2026-09-20 18:39:30.000', 0, NULL, '#3B82F6', NULL, 1, '2026-09-19 15:39:30.725', '2026-09-19 15:39:30.725'),
(13, 'Test Cours - Semaine prochaine', '�v�nement de test pour v�rifier l\'agenda', 'COURSE', 'PUBLIC', '2026-09-22 20:51:22.000', '2026-09-22 20:51:22.000', 0, 'Amphi A', '#3B82F6', NULL, 1, '2026-09-19 17:51:22.420', '2026-09-19 17:51:22.420');

-- --------------------------------------------------------

--
-- Structure de la table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `title` varchar(191) NOT NULL,
  `code` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `credits` int(11) NOT NULL DEFAULT 0,
  `hours` int(11) NOT NULL DEFAULT 0,
  `status` enum('DRAFT','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  `color` varchar(191) DEFAULT '#3B82F6',
  `cover_url` varchar(191) DEFAULT NULL,
  `unit_id` int(11) DEFAULT NULL,
  `created_by_id` int(11) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `coefficient` int(11) NOT NULL DEFAULT 1,
  `teaching_unit_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `courses`
--

INSERT INTO `courses` (`id`, `title`, `code`, `description`, `credits`, `hours`, `status`, `color`, `cover_url`, `unit_id`, `created_by_id`, `created_at`, `updated_at`, `coefficient`, `teaching_unit_id`) VALUES
(11, 'programmation sous php', 'PHP', '', 2, 20, 'PUBLISHED', '#3B82F6', NULL, NULL, 1, '2026-09-19 19:10:40.965', '2026-10-27 17:50:03.957', 1, 2);

-- --------------------------------------------------------

--
-- Structure de la table `course_announcements`
--

CREATE TABLE `course_announcements` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `author_id` int(11) NOT NULL,
  `title` varchar(191) NOT NULL,
  `content` text NOT NULL,
  `priority` enum('NORMAL','IMPORTANT','URGENT') NOT NULL DEFAULT 'NORMAL',
  `is_pinned` tinyint(1) NOT NULL DEFAULT 0,
  `expires_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `course_announcements`
--

INSERT INTO `course_announcements` (`id`, `course_id`, `author_id`, `title`, `content`, `priority`, `is_pinned`, `expires_at`, `created_at`, `updated_at`) VALUES
(3, 11, 1, 'Examen', 'l\'examen sera dans une semaine', 'IMPORTANT', 0, '2026-09-20 19:34:00.000', '2026-09-20 19:33:09.232', '2026-09-20 19:33:09.232');

-- --------------------------------------------------------

--
-- Structure de la table `course_classes`
--

CREATE TABLE `course_classes` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `course_classes`
--

INSERT INTO `course_classes` (`id`, `course_id`, `class_id`, `created_at`) VALUES
(5, 11, 19, '2026-09-20 17:54:18.810');

-- --------------------------------------------------------

--
-- Structure de la table `course_lessons`
--

CREATE TABLE `course_lessons` (
  `id` int(11) NOT NULL,
  `module_id` int(11) NOT NULL,
  `title` varchar(191) NOT NULL,
  `content` text DEFAULT NULL,
  `content_type` enum('TEXT','VIDEO','LINK','FILE','MIXED') NOT NULL DEFAULT 'TEXT',
  `video_url` varchar(191) DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `order_index` int(11) NOT NULL DEFAULT 0,
  `is_published` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `course_materials`
--

CREATE TABLE `course_materials` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `uploaded_by_id` int(11) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('PDF','VIDEO','IMAGE','ZIP','DOCUMENT','LINK','OTHER') NOT NULL DEFAULT 'OTHER',
  `file_url` varchar(191) NOT NULL,
  `file_name` varchar(191) NOT NULL,
  `file_size` int(11) NOT NULL,
  `mime_type` varchar(191) NOT NULL,
  `visibility` enum('STUDENTS','TEACHERS','ALL','PRIVATE') NOT NULL DEFAULT 'STUDENTS',
  `published_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `expires_at` datetime(3) DEFAULT NULL,
  `expiration_status` enum('ACTIVE','EXPIRING_SOON','PENDING_REVIEW','EXPIRED','EXTENDED','ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
  `grace_period_ends_at` datetime(3) DEFAULT NULL,
  `expiration_notified_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `course_materials`
--

INSERT INTO `course_materials` (`id`, `course_id`, `uploaded_by_id`, `title`, `description`, `type`, `file_url`, `file_name`, `file_size`, `mime_type`, `visibility`, `published_at`, `expires_at`, `expiration_status`, `grace_period_ends_at`, `expiration_notified_at`, `created_at`, `updated_at`) VALUES
(7, 11, 1, 'Nouveau Document texte', NULL, 'DOCUMENT', '/uploads/materials/2026-09/Nouveau_Document_texte-1789926881488-866264289.txt', 'Nouveau Document texte.txt', 68, 'text/plain', 'STUDENTS', '2026-09-20 17:54:41.535', '2026-09-27 17:54:41.535', 'ACTIVE', NULL, NULL, '2026-09-20 17:54:41.549', '2026-09-20 17:54:41.549'),
(9, 11, 1, 'Config mail', NULL, 'VIDEO', '/uploads/materials/2026-09/Config_mail-1790319664450-960364804.mp4', 'Config mail.mp4', 7341937, 'video/mp4', 'STUDENTS', '2026-09-25 07:01:04.633', '2026-10-02 07:01:04.633', 'ACTIVE', NULL, NULL, '2026-09-25 07:01:04.641', '2026-09-25 07:01:04.641'),
(10, 11, 11, 'Nouveau Document texte', NULL, 'DOCUMENT', '/uploads/materials/2026-09/Nouveau_Document_texte-1790319710805-416771397.txt', 'Nouveau Document texte.txt', 68, 'text/plain', 'STUDENTS', '2026-09-25 07:01:50.854', '2026-12-25 07:01:50.812', 'ACTIVE', NULL, NULL, '2026-09-25 07:01:50.862', '2026-09-25 07:01:50.862'),
(11, 11, 11, 'tableau_comparaison_LMS', NULL, 'DOCUMENT', '/uploads/materials/2026-10/tableau_comparaison_LMS-1791570925660-106942431.docx', 'tableau_comparaison_LMS.docx', 9827, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'STUDENTS', '2026-10-09 18:35:25.724', '2026-10-16 18:35:25.723', 'ACTIVE', NULL, NULL, '2026-10-09 18:35:25.727', '2026-10-09 18:35:25.727'),
(12, 11, 11, '09_certificat_medical', NULL, 'PDF', '/uploads/materials/2026-10/09_certificat_medical-1791618130688-527346662.pdf', '09_certificat_medical.pdf', 1941, 'application/pdf', 'STUDENTS', '2026-10-10 07:42:10.752', '2027-01-10 07:42:10.751', 'ACTIVE', NULL, NULL, '2026-10-10 07:42:10.761', '2026-10-10 07:42:10.761'),
(13, 11, 11, 'Lecon_POO_PHP', NULL, 'PDF', '/uploads/materials/2026-10/Lecon_POO_PHP-1791924066586-543066308.pdf', 'Lecon_POO_PHP.pdf', 8731, 'application/pdf', 'STUDENTS', '2026-10-13 20:41:06.630', '2026-10-20 20:41:06.630', 'ACTIVE', NULL, NULL, '2026-10-13 20:41:06.633', '2026-10-13 20:41:06.633');

-- --------------------------------------------------------

--
-- Structure de la table `course_modules`
--

CREATE TABLE `course_modules` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `order_index` int(11) NOT NULL DEFAULT 0,
  `duration` int(11) DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `course_sessions`
--

CREATE TABLE `course_sessions` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `code` varchar(191) NOT NULL,
  `academic_year` varchar(191) NOT NULL,
  `start_date` datetime(3) NOT NULL,
  `end_date` datetime(3) NOT NULL,
  `capacity` int(11) NOT NULL DEFAULT 30,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `course_teachers`
--

CREATE TABLE `course_teachers` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `role` varchar(191) NOT NULL DEFAULT 'MAIN',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `course_teachers`
--

INSERT INTO `course_teachers` (`id`, `course_id`, `teacher_id`, `role`, `created_at`) VALUES
(9, 11, 11, 'MAIN', '2026-09-25 06:59:23.937');

-- --------------------------------------------------------

--
-- Structure de la table `discounts`
--

CREATE TABLE `discounts` (
  `id` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('PERCENTAGE','FIXED_AMOUNT','FULL_EXEMPTION') NOT NULL,
  `value` decimal(12,2) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `enrollments`
--

CREATE TABLE `enrollments` (
  `id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `status` enum('ACTIVE','COMPLETED','DROPPED','PENDING') NOT NULL DEFAULT 'ACTIVE',
  `enrolled_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `completed_at` datetime(3) DEFAULT NULL,
  `grade` decimal(5,2) DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `exams`
--

CREATE TABLE `exams` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `duration` int(11) NOT NULL DEFAULT 60,
  `passing_score` int(11) NOT NULL DEFAULT 10,
  `status` enum('DRAFT','PUBLISHED','CLOSED') NOT NULL DEFAULT 'DRAFT',
  `created_by_id` int(11) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `exams`
--

INSERT INTO `exams` (`id`, `course_id`, `title`, `description`, `duration`, `passing_score`, `status`, `created_by_id`, `created_at`, `updated_at`) VALUES
(1, 11, 'la généralité de web', '', 40, 10, 'DRAFT', 11, '2026-11-10 18:08:40.555', '2026-11-10 18:08:40.555'),
(2, 11, 'generaliter', '', 5, 10, 'DRAFT', 11, '2026-11-10 18:10:06.141', '2026-11-10 18:10:06.141');

-- --------------------------------------------------------

--
-- Structure de la table `exam_attempts`
--

CREATE TABLE `exam_attempts` (
  `id` int(11) NOT NULL,
  `exam_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `score` decimal(5,2) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'IN_PROGRESS',
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `submitted_at` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `exam_questions`
--

CREATE TABLE `exam_questions` (
  `id` int(11) NOT NULL,
  `exam_id` int(11) NOT NULL,
  `question` text NOT NULL,
  `type` enum('MULTIPLE_CHOICE','TRUE_FALSE','SHORT_ANSWER') NOT NULL DEFAULT 'SHORT_ANSWER',
  `correct_answer` text DEFAULT NULL,
  `points` int(11) NOT NULL DEFAULT 1,
  `order_index` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `exam_questions`
--

INSERT INTO `exam_questions` (`id`, `exam_id`, `question`, `type`, `correct_answer`, `points`, `order_index`) VALUES
(1, 1, 'Qu\'est-ce que la programmation web ?', 'SHORT_ANSWER', 'C\'est l\'ensemble des techniques permettant de créer des sites web et des applications accessibles depuis un navigateur.', 5, 0),
(2, 1, 'Quelle est la différence entre Internet et le Web ?', 'SHORT_ANSWER', 'Internet est un réseau mondial d\'ordinateurs. Le Web est un service qui fonctionne sur Internet et permet de consulter des pages web.', 5, 1),
(3, 1, 'Qu\'est-ce qu\'un navigateur web ?', 'SHORT_ANSWER', 'C\'est un logiciel permettant d\'accéder aux sites web, par exemple Chrome, Firefox ou Edge.', 5, 2),
(4, 1, 'Qu\'est-ce qu\'un serveur web ?', 'SHORT_ANSWER', 'C\'est un système qui reçoit les requêtes des clients et leur fournit des ressources web.', 5, 3),
(5, 1, 'Qu\'est-ce qu\'un client en programmation web ?', 'SHORT_ANSWER', 'C\'est généralement le navigateur ou l\'application qui envoie des requêtes à un serveur.', 5, 4),
(6, 2, 'Quelle est la différence entre frontend et backend ?', 'SHORT_ANSWER', 'Frontend : partie visible et interactive de l\'application.\n\n\n\nBackend : partie qui gère les traitements, les données et la logique métier.', 5, 0),
(7, 2, 'Qu\'est-ce qu\'un client en programmation web ?', 'SHORT_ANSWER', 'C\'est généralement le navigateur ou l\'application qui envoie des requêtes à un serveur.', 1, 1);

-- --------------------------------------------------------

--
-- Structure de la table `fees`
--

CREATE TABLE `fees` (
  `id` int(11) NOT NULL,
  `fee_type_id` int(11) NOT NULL,
  `class_id` int(11) DEFAULT NULL,
  `level_id` int(11) DEFAULT NULL,
  `academic_year` varchar(191) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` varchar(191) NOT NULL DEFAULT 'MGA',
  `due_date` datetime(3) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `fees`
--

INSERT INTO `fees` (`id`, `fee_type_id`, `class_id`, `level_id`, `academic_year`, `amount`, `currency`, `due_date`, `is_active`, `notes`, `created_at`, `updated_at`) VALUES
(1, 2, 19, NULL, '2025-2026', 1500000.00, 'MGA', NULL, 1, NULL, '2026-09-21 08:40:28.925', '2026-09-21 08:40:28.925');

-- --------------------------------------------------------

--
-- Structure de la table `fee_types`
--

CREATE TABLE `fee_types` (
  `id` int(11) NOT NULL,
  `code` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `is_recurring` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `fee_types`
--

INSERT INTO `fee_types` (`id`, `code`, `name`, `description`, `is_recurring`, `is_active`, `display_order`, `created_at`, `updated_at`) VALUES
(1, 'INSCRIPTION', 'Frais d\'inscription', 'Frais d\'inscription annuels', 0, 1, 0, '2026-09-21 08:40:28.505', '2026-09-21 08:40:28.505'),
(2, 'SCOLARITE', 'Frais de scolarit�', 'Frais de scolarit� mensuels', 1, 1, 0, '2026-09-21 08:40:28.586', '2026-09-21 08:40:28.586');

-- --------------------------------------------------------

--
-- Structure de la table `institution_units`
--

CREATE TABLE `institution_units` (
  `id` int(11) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `name` varchar(191) NOT NULL,
  `code` varchar(191) DEFAULT NULL,
  `type` enum('ESTABLISHMENT','FACULTY','DEPARTMENT','PROGRAM','LEVEL','CLASS','GROUP') NOT NULL,
  `description` text DEFAULT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `institution_units`
--

INSERT INTO `institution_units` (`id`, `parent_id`, `name`, `code`, `type`, `description`, `display_order`, `is_active`, `metadata`, `created_at`, `updated_at`) VALUES
(9, NULL, 'i-Learning', 'ROOT', 'ESTABLISHMENT', NULL, 0, 1, NULL, '2026-09-19 07:25:35.120', '2026-09-19 07:25:35.120'),
(10, 9, 'INFORMATIQUE', 'INFO', 'DEPARTMENT', '', 0, 1, 'null', '2026-09-19 07:28:07.578', '2026-09-19 07:32:17.292'),
(11, 10, 'Administration Systeme Réseau', 'ASR', 'PROGRAM', '', 0, 1, 'null', '2026-09-19 07:28:49.814', '2026-09-19 07:35:00.437'),
(12, 10, 'Developpement d\'Application', 'DAI', 'PROGRAM', NULL, 0, 1, 'null', '2026-09-19 07:29:16.560', '2026-09-19 07:29:16.560'),
(13, 9, 'GESTION', 'GES', 'DEPARTMENT', NULL, 0, 1, 'null', '2026-09-19 07:30:01.357', '2026-09-19 07:30:01.357'),
(14, 13, 'FINACE ET COMPTABLE', 'FC', 'PROGRAM', NULL, 0, 1, 'null', '2026-09-19 07:30:51.009', '2026-09-19 07:30:51.009'),
(15, 13, 'ADMINISTRATION ENTREPRISE', 'AE', 'PROGRAM', NULL, 0, 1, 'null', '2026-09-19 07:31:18.900', '2026-09-19 07:31:18.900'),
(16, 15, 'Licence1', 'L1', 'LEVEL', NULL, 0, 1, 'null', '2026-09-19 07:32:01.512', '2026-09-19 07:32:01.512'),
(17, 15, 'Licence 2', 'L2', 'LEVEL', NULL, 0, 1, 'null', '2026-09-19 07:33:22.887', '2026-09-19 07:33:22.887'),
(18, 15, 'Licence 3', 'L3', 'LEVEL', NULL, 0, 1, 'null', '2026-09-19 07:34:21.375', '2026-09-19 07:34:21.375'),
(19, 17, 'L1-INFO-A', 'L1-INFO-A', 'CLASS', 'Classe de test pour la Phase 5.3', 0, 1, 'null', '2026-09-19 11:45:17.808', '2026-09-19 11:45:17.808'),
(20, 9, 'Test DEPARTMENT 449480732', 'TEST-503387624', 'DEPARTMENT', NULL, 0, 1, 'null', '2026-09-19 15:36:27.242', '2026-09-19 15:36:27.242'),
(21, 9, 'Test DEPARTMENT 1479939049', 'TEST-1512478752', 'DEPARTMENT', NULL, 0, 1, 'null', '2026-09-19 15:39:30.600', '2026-09-19 15:39:30.600');

-- --------------------------------------------------------

--
-- Structure de la table `invoices`
--

CREATE TABLE `invoices` (
  `id` int(11) NOT NULL,
  `reference` varchar(191) NOT NULL,
  `student_id` int(11) NOT NULL,
  `fee_id` int(11) NOT NULL,
  `enrollment_id` int(11) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `paid_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `currency` varchar(191) NOT NULL DEFAULT 'MGA',
  `status` enum('DRAFT','SENT','PARTIALLY_PAID','PAID','OVERDUE','CANCELLED') NOT NULL DEFAULT 'DRAFT',
  `due_date` datetime(3) NOT NULL,
  `issued_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `notes` text DEFAULT NULL,
  `installment_no` int(11) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `academic_year_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `invoices`
--

INSERT INTO `invoices` (`id`, `reference`, `student_id`, `fee_id`, `enrollment_id`, `amount`, `paid_amount`, `currency`, `status`, `due_date`, `issued_at`, `notes`, `installment_no`, `created_at`, `updated_at`, `academic_year_id`) VALUES
(19, 'INV-TEST-001', 12, 1, NULL, 500000.00, 500000.00, 'MGA', 'PAID', '2026-11-16 09:38:22.000', '2026-10-17 09:38:22.000', NULL, NULL, '2026-10-17 09:38:22.000', '2026-10-17 06:40:27.221', NULL),
(20, 'FAC-2026-0001', 12, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:42.978', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:42.978', '2026-10-17 06:48:42.978', NULL),
(21, 'FAC-2026-0002', 12, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:43.005', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:43.005', '2026-10-17 06:48:43.005', NULL),
(22, 'FAC-2026-0003', 12, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:43.037', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:43.037', '2026-10-17 06:48:43.037', NULL),
(23, 'FAC-2026-0004', 12, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:43.061', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:43.061', '2026-10-17 06:48:43.061', NULL),
(24, 'FAC-2026-0005', 12, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:43.081', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:43.081', '2026-10-17 06:48:43.081', NULL),
(25, 'FAC-2026-0006', 12, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:43.105', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:43.105', '2026-10-17 06:48:43.105', NULL),
(26, 'FAC-2026-0007', 12, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:43.127', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:43.127', '2026-10-17 06:48:43.127', NULL),
(27, 'FAC-2026-0008', 12, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:43.148', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:43.148', '2026-10-17 06:48:43.148', NULL),
(28, 'FAC-2026-0009', 12, 1, NULL, 166666.67, 150000.00, 'MGA', 'OVERDUE', '2026-06-04 21:00:00.000', '2026-10-17 06:48:43.172', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:43.172', '2026-11-06 05:33:55.950', NULL),
(29, 'FAC-2026-0010', 13, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:43.195', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:43.195', '2026-10-17 06:48:43.195', NULL),
(30, 'FAC-2026-0011', 13, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:43.217', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:43.217', '2026-10-17 06:48:43.217', NULL),
(31, 'FAC-2026-0012', 13, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:43.239', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:43.239', '2026-10-17 06:48:43.239', NULL),
(32, 'FAC-2026-0013', 13, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:43.259', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:43.259', '2026-10-17 06:48:43.259', NULL),
(33, 'FAC-2026-0014', 13, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:43.279', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:43.279', '2026-10-17 06:48:43.279', NULL),
(34, 'FAC-2026-0015', 13, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:43.300', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:43.300', '2026-10-17 06:48:43.300', NULL),
(35, 'FAC-2026-0016', 13, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:43.324', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:43.324', '2026-10-17 06:48:43.324', NULL),
(36, 'FAC-2026-0017', 13, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:43.348', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:43.348', '2026-10-17 06:48:43.348', NULL),
(37, 'FAC-2026-0018', 13, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:43.374', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:43.374', '2026-10-17 06:48:43.374', NULL),
(38, 'FAC-2026-0019', 14, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:43.396', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:43.396', '2026-10-17 06:48:43.396', NULL),
(39, 'FAC-2026-0020', 14, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:43.419', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:43.419', '2026-10-17 06:48:43.419', NULL),
(40, 'FAC-2026-0021', 14, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:43.443', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:43.443', '2026-10-17 06:48:43.443', NULL),
(41, 'FAC-2026-0022', 14, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:43.463', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:43.463', '2026-10-17 06:48:43.463', NULL),
(42, 'FAC-2026-0023', 14, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:43.490', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:43.490', '2026-10-17 06:48:43.490', NULL),
(43, 'FAC-2026-0024', 14, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:43.640', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:43.640', '2026-10-17 06:48:43.640', NULL),
(44, 'FAC-2026-0025', 14, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:43.774', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:43.774', '2026-10-17 06:48:43.774', NULL),
(45, 'FAC-2026-0026', 14, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:43.822', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:43.822', '2026-10-17 06:48:43.822', NULL),
(46, 'FAC-2026-0027', 14, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:43.859', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:43.859', '2026-10-17 06:48:43.859', NULL),
(47, 'FAC-2026-0028', 15, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:43.879', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:43.879', '2026-10-17 06:48:43.879', NULL),
(48, 'FAC-2026-0029', 15, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:43.904', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:43.904', '2026-10-17 06:48:43.904', NULL),
(49, 'FAC-2026-0030', 15, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:43.927', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:43.927', '2026-10-17 06:48:43.927', NULL),
(50, 'FAC-2026-0031', 15, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:43.953', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:43.953', '2026-10-17 06:48:43.953', NULL),
(51, 'FAC-2026-0032', 15, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:43.975', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:43.975', '2026-10-17 06:48:43.975', NULL),
(52, 'FAC-2026-0033', 15, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:43.995', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:43.995', '2026-10-17 06:48:43.995', NULL),
(53, 'FAC-2026-0034', 15, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:44.015', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:44.015', '2026-10-17 06:48:44.015', NULL),
(54, 'FAC-2026-0035', 15, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:44.038', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:44.038', '2026-10-17 06:48:44.038', NULL),
(55, 'FAC-2026-0036', 15, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:44.062', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:44.062', '2026-10-17 06:48:44.062', NULL),
(56, 'FAC-2026-0037', 16, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:44.087', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:44.087', '2026-10-17 06:48:44.087', NULL),
(57, 'FAC-2026-0038', 16, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:44.109', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:44.109', '2026-10-17 06:48:44.109', NULL),
(58, 'FAC-2026-0039', 16, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:44.128', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:44.128', '2026-10-17 06:48:44.128', NULL),
(59, 'FAC-2026-0040', 16, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:44.149', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:44.149', '2026-10-17 06:48:44.149', NULL),
(60, 'FAC-2026-0041', 16, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:44.176', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:44.176', '2026-10-17 06:48:44.176', NULL),
(61, 'FAC-2026-0042', 16, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:44.195', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:44.195', '2026-10-17 06:48:44.195', NULL),
(62, 'FAC-2026-0043', 16, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:44.220', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:44.220', '2026-10-17 06:48:44.220', NULL),
(63, 'FAC-2026-0044', 16, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:44.243', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:44.243', '2026-10-17 06:48:44.243', NULL),
(64, 'FAC-2026-0045', 16, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:44.263', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:44.263', '2026-10-17 06:48:44.263', NULL),
(65, 'FAC-2026-0046', 17, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:44.288', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:44.288', '2026-10-17 06:48:44.288', NULL),
(66, 'FAC-2026-0047', 17, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:44.312', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:44.312', '2026-10-17 06:48:44.312', NULL),
(67, 'FAC-2026-0048', 17, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:44.333', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:44.333', '2026-10-17 06:48:44.333', NULL),
(68, 'FAC-2026-0049', 17, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:44.361', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:44.361', '2026-10-17 06:48:44.361', NULL),
(69, 'FAC-2026-0050', 17, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:44.385', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:44.385', '2026-10-17 06:48:44.385', NULL),
(70, 'FAC-2026-0051', 17, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:44.411', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:44.411', '2026-10-17 06:48:44.411', NULL),
(71, 'FAC-2026-0052', 17, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:44.433', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:44.433', '2026-10-17 06:48:44.433', NULL),
(72, 'FAC-2026-0053', 17, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:44.455', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:44.455', '2026-10-17 06:48:44.455', NULL),
(73, 'FAC-2026-0054', 17, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:44.477', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:44.477', '2026-10-17 06:48:44.477', NULL),
(74, 'FAC-2026-0055', 18, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:44.497', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:44.497', '2026-10-17 06:48:44.497', NULL),
(75, 'FAC-2026-0056', 18, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:44.522', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:44.522', '2026-10-17 06:48:44.522', NULL),
(76, 'FAC-2026-0057', 18, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:44.544', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:44.544', '2026-10-17 06:48:44.544', NULL),
(77, 'FAC-2026-0058', 18, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:44.565', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:44.565', '2026-10-17 06:48:44.565', NULL),
(78, 'FAC-2026-0059', 18, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:44.593', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:44.593', '2026-10-17 06:48:44.593', NULL),
(79, 'FAC-2026-0060', 18, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:44.613', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:44.613', '2026-10-17 06:48:44.613', NULL),
(80, 'FAC-2026-0061', 18, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:44.645', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:44.645', '2026-10-17 06:48:44.645', NULL),
(81, 'FAC-2026-0062', 18, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:44.673', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:44.673', '2026-10-17 06:48:44.673', NULL),
(82, 'FAC-2026-0063', 18, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:44.712', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:44.712', '2026-10-17 06:48:44.712', NULL),
(83, 'FAC-2026-0064', 19, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:44.737', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:44.737', '2026-10-17 06:48:44.737', NULL),
(84, 'FAC-2026-0065', 19, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:44.759', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:44.759', '2026-10-17 06:48:44.759', NULL),
(85, 'FAC-2026-0066', 19, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:44.778', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:44.778', '2026-10-17 06:48:44.778', NULL),
(86, 'FAC-2026-0067', 19, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:44.801', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:44.801', '2026-10-17 06:48:44.801', NULL),
(87, 'FAC-2026-0068', 19, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:45.105', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:45.105', '2026-10-17 06:48:45.105', NULL),
(88, 'FAC-2026-0069', 19, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:45.162', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:45.162', '2026-10-17 06:48:45.162', NULL),
(89, 'FAC-2026-0070', 19, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:45.187', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:45.187', '2026-10-17 06:48:45.187', NULL),
(90, 'FAC-2026-0071', 19, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:45.208', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:45.208', '2026-10-17 06:48:45.208', NULL),
(91, 'FAC-2026-0072', 19, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:45.228', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:45.228', '2026-10-17 06:48:45.228', NULL),
(92, 'FAC-2026-0073', 20, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:45.254', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:45.254', '2026-10-17 06:48:45.254', NULL),
(93, 'FAC-2026-0074', 20, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:45.276', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:45.276', '2026-10-17 06:48:45.276', NULL),
(94, 'FAC-2026-0075', 20, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:45.295', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:45.295', '2026-10-17 06:48:45.295', NULL),
(95, 'FAC-2026-0076', 20, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:45.323', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:45.323', '2026-10-17 06:48:45.323', NULL),
(96, 'FAC-2026-0077', 20, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:45.345', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:45.345', '2026-10-17 06:48:45.345', NULL),
(97, 'FAC-2026-0078', 20, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:45.373', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:45.373', '2026-10-17 06:48:45.373', NULL),
(98, 'FAC-2026-0079', 20, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:45.393', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:45.393', '2026-10-17 06:48:45.393', NULL),
(99, 'FAC-2026-0080', 20, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:45.416', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:45.416', '2026-10-17 06:48:45.416', NULL),
(100, 'FAC-2026-0081', 20, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:45.438', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:45.438', '2026-10-17 06:48:45.438', NULL),
(101, 'FAC-2026-0082', 21, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:45.460', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:45.460', '2026-10-17 06:48:45.460', NULL),
(102, 'FAC-2026-0083', 21, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:45.481', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:45.481', '2026-10-17 06:48:45.481', NULL),
(103, 'FAC-2026-0084', 21, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:45.506', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:45.506', '2026-10-17 06:48:45.506', NULL),
(104, 'FAC-2026-0085', 21, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:45.530', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:45.530', '2026-10-17 06:48:45.530', NULL),
(105, 'FAC-2026-0086', 21, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:45.554', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:45.554', '2026-10-17 06:48:45.554', NULL),
(106, 'FAC-2026-0087', 21, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:45.576', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:45.576', '2026-10-17 06:48:45.576', NULL),
(107, 'FAC-2026-0088', 21, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:45.596', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:45.596', '2026-10-17 06:48:45.596', NULL),
(108, 'FAC-2026-0089', 21, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:45.621', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:45.621', '2026-10-17 06:48:45.621', NULL),
(109, 'FAC-2026-0090', 21, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:45.642', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:45.642', '2026-10-17 06:48:45.642', NULL),
(110, 'FAC-2026-0091', 22, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:45.663', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:45.663', '2026-10-17 06:48:45.663', NULL),
(111, 'FAC-2026-0092', 22, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:45.687', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:45.687', '2026-10-17 06:48:45.687', NULL),
(112, 'FAC-2026-0093', 22, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:45.710', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:45.710', '2026-10-17 06:48:45.710', NULL),
(113, 'FAC-2026-0094', 22, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:45.763', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:45.763', '2026-10-17 06:48:45.763', NULL),
(114, 'FAC-2026-0095', 22, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:45.796', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:45.796', '2026-10-17 06:48:45.796', NULL),
(115, 'FAC-2026-0096', 22, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:45.820', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:45.820', '2026-10-17 06:48:45.820', NULL),
(116, 'FAC-2026-0097', 22, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:45.843', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:45.843', '2026-10-17 06:48:45.843', NULL),
(117, 'FAC-2026-0098', 22, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:45.863', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:45.863', '2026-10-17 06:48:45.863', NULL),
(118, 'FAC-2026-0099', 22, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:45.892', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:45.892', '2026-10-17 06:48:45.892', NULL),
(119, 'FAC-2026-0100', 23, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:45.924', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:45.924', '2026-10-17 06:48:45.924', NULL),
(120, 'FAC-2026-0101', 23, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:45.954', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:45.954', '2026-10-17 06:48:45.954', NULL),
(121, 'FAC-2026-0102', 23, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:45.980', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:45.980', '2026-10-17 06:48:45.980', NULL),
(122, 'FAC-2026-0103', 23, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:46.007', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:46.007', '2026-10-17 06:48:46.007', NULL),
(123, 'FAC-2026-0104', 23, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:46.277', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:46.277', '2026-10-17 06:48:46.277', NULL),
(124, 'FAC-2026-0105', 23, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:46.440', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:46.440', '2026-10-17 06:48:46.440', NULL),
(125, 'FAC-2026-0106', 23, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:46.509', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:46.509', '2026-10-17 06:48:46.509', NULL),
(126, 'FAC-2026-0107', 23, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:46.541', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:46.541', '2026-10-17 06:48:46.541', NULL),
(127, 'FAC-2026-0108', 23, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:46.574', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:46.574', '2026-10-17 06:48:46.574', NULL),
(128, 'FAC-2026-0109', 24, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:46.595', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:46.595', '2026-10-17 06:48:46.595', NULL),
(129, 'FAC-2026-0110', 24, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:46.626', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:46.626', '2026-10-17 06:48:46.626', NULL),
(130, 'FAC-2026-0111', 24, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:46.659', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:46.659', '2026-10-17 06:48:46.659', NULL),
(131, 'FAC-2026-0112', 24, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:46.689', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:46.689', '2026-10-17 06:48:46.689', NULL),
(132, 'FAC-2026-0113', 24, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:46.723', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:46.723', '2026-10-17 06:48:46.723', NULL),
(133, 'FAC-2026-0114', 24, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:46.758', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:46.758', '2026-10-17 06:48:46.758', NULL),
(134, 'FAC-2026-0115', 24, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:46.795', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:46.795', '2026-10-17 06:48:46.795', NULL),
(135, 'FAC-2026-0116', 24, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:46.821', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:46.821', '2026-10-17 06:48:46.821', NULL),
(136, 'FAC-2026-0117', 24, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:46.890', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:46.890', '2026-10-17 06:48:46.890', NULL),
(137, 'FAC-2026-0118', 25, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:46.921', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:46.921', '2026-10-17 06:48:46.921', NULL),
(138, 'FAC-2026-0119', 25, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:46.960', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:46.960', '2026-10-17 06:48:46.960', NULL),
(139, 'FAC-2026-0120', 25, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:46.986', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:46.986', '2026-10-17 06:48:46.986', NULL),
(140, 'FAC-2026-0121', 25, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:47.006', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:47.006', '2026-10-17 06:48:47.006', NULL),
(141, 'FAC-2026-0122', 25, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:47.031', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:47.031', '2026-10-17 06:48:47.031', NULL),
(142, 'FAC-2026-0123', 25, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:47.056', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:47.056', '2026-10-17 06:48:47.056', NULL),
(143, 'FAC-2026-0124', 25, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:47.076', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:47.076', '2026-10-17 06:48:47.076', NULL),
(144, 'FAC-2026-0125', 25, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:47.096', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:47.096', '2026-10-17 06:48:47.096', NULL),
(145, 'FAC-2026-0126', 25, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:47.117', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:47.117', '2026-10-17 06:48:47.117', NULL),
(146, 'FAC-2026-0127', 26, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:47.138', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:47.138', '2026-10-17 06:48:47.138', NULL),
(147, 'FAC-2026-0128', 26, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:47.158', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:47.158', '2026-10-17 06:48:47.158', NULL),
(148, 'FAC-2026-0129', 26, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:47.178', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:47.178', '2026-10-17 06:48:47.178', NULL),
(149, 'FAC-2026-0130', 26, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:47.204', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:47.204', '2026-10-17 06:48:47.204', NULL),
(150, 'FAC-2026-0131', 26, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:47.226', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:47.226', '2026-10-17 06:48:47.226', NULL),
(151, 'FAC-2026-0132', 26, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:47.244', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:47.244', '2026-10-17 06:48:47.244', NULL),
(152, 'FAC-2026-0133', 26, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:47.266', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:47.266', '2026-10-17 06:48:47.266', NULL),
(153, 'FAC-2026-0134', 26, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:47.289', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:47.289', '2026-10-17 06:48:47.289', NULL),
(154, 'FAC-2026-0135', 26, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:47.451', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:47.451', '2026-10-17 06:48:47.451', NULL),
(155, 'FAC-2026-0136', 27, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:47.571', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:47.571', '2026-10-17 06:48:47.571', NULL),
(156, 'FAC-2026-0137', 27, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:47.695', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:47.695', '2026-10-17 06:48:47.695', NULL),
(157, 'FAC-2026-0138', 27, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:47.729', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:47.729', '2026-10-17 06:48:47.729', NULL),
(158, 'FAC-2026-0139', 27, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:47.758', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:47.758', '2026-10-17 06:48:47.758', NULL),
(159, 'FAC-2026-0140', 27, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:47.777', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:47.777', '2026-10-17 06:48:47.777', NULL),
(160, 'FAC-2026-0141', 27, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:47.798', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:47.798', '2026-10-17 06:48:47.798', NULL),
(161, 'FAC-2026-0142', 27, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:47.821', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:47.821', '2026-10-17 06:48:47.821', NULL),
(162, 'FAC-2026-0143', 27, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:47.842', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:47.842', '2026-10-17 06:48:47.842', NULL),
(163, 'FAC-2026-0144', 27, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:47.862', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:47.862', '2026-10-17 06:48:47.862', NULL),
(164, 'FAC-2026-0145', 28, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:47.889', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:47.889', '2026-10-17 06:48:47.889', NULL),
(165, 'FAC-2026-0146', 28, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:47.911', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:47.911', '2026-10-17 06:48:47.911', NULL),
(166, 'FAC-2026-0147', 28, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:47.938', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:47.938', '2026-10-17 06:48:47.938', NULL),
(167, 'FAC-2026-0148', 28, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:47.959', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:47.959', '2026-10-17 06:48:47.959', NULL),
(168, 'FAC-2026-0149', 28, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:47.979', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:47.979', '2026-10-17 06:48:47.979', NULL),
(169, 'FAC-2026-0150', 28, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:48.005', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:48.005', '2026-10-17 06:48:48.005', NULL),
(170, 'FAC-2026-0151', 28, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:48.025', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:48.025', '2026-10-17 06:48:48.025', NULL),
(171, 'FAC-2026-0152', 28, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:48.045', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:48.045', '2026-10-17 06:48:48.045', NULL),
(172, 'FAC-2026-0153', 28, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:48.064', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:48.064', '2026-10-17 06:48:48.064', NULL),
(173, 'FAC-2026-0154', 29, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:48.089', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:48.089', '2026-10-17 06:48:48.089', NULL),
(174, 'FAC-2026-0155', 29, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:48.109', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:48.109', '2026-10-17 06:48:48.109', NULL),
(175, 'FAC-2026-0156', 29, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:48.128', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:48.128', '2026-10-17 06:48:48.128', NULL),
(176, 'FAC-2026-0157', 29, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:48.151', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:48.151', '2026-10-17 06:48:48.151', NULL),
(177, 'FAC-2026-0158', 29, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:48.172', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:48.172', '2026-10-17 06:48:48.172', NULL),
(178, 'FAC-2026-0159', 29, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:48.191', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:48.191', '2026-10-17 06:48:48.191', NULL),
(179, 'FAC-2026-0160', 29, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:48.211', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:48.211', '2026-10-17 06:48:48.211', NULL),
(180, 'FAC-2026-0161', 29, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:48.231', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:48.231', '2026-10-17 06:48:48.231', NULL),
(181, 'FAC-2026-0162', 29, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:48.254', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:48.254', '2026-10-17 06:48:48.254', NULL),
(182, 'FAC-2026-0163', 30, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:48.274', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:48.274', '2026-10-17 06:48:48.274', NULL),
(183, 'FAC-2026-0164', 30, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:48.294', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:48.294', '2026-10-17 06:48:48.294', NULL),
(184, 'FAC-2026-0165', 30, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:48.313', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:48.313', '2026-10-17 06:48:48.313', NULL),
(185, 'FAC-2026-0166', 30, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:48.337', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:48.337', '2026-10-17 06:48:48.337', NULL),
(186, 'FAC-2026-0167', 30, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:48.358', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:48.358', '2026-10-17 06:48:48.358', NULL),
(187, 'FAC-2026-0168', 30, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:48.377', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:48.377', '2026-10-17 06:48:48.377', NULL),
(188, 'FAC-2026-0169', 30, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:48.397', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:48.397', '2026-10-17 06:48:48.397', NULL),
(189, 'FAC-2026-0170', 30, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:48.425', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:48.425', '2026-10-17 06:48:48.425', NULL),
(190, 'FAC-2026-0171', 30, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:48.445', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:48.445', '2026-10-17 06:48:48.445', NULL),
(191, 'FAC-2026-0172', 31, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:48.467', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:48.467', '2026-10-17 06:48:48.467', NULL),
(192, 'FAC-2026-0173', 31, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:48.487', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:48.487', '2026-10-17 06:48:48.487', NULL),
(193, 'FAC-2026-0174', 31, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:48.508', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:48.508', '2026-10-17 06:48:48.508', NULL),
(194, 'FAC-2026-0175', 31, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:48.528', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:48.528', '2026-10-17 06:48:48.528', NULL),
(195, 'FAC-2026-0176', 31, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:48.548', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:48.548', '2026-10-17 06:48:48.548', NULL),
(196, 'FAC-2026-0177', 31, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:48.573', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:48.573', '2026-10-17 06:48:48.573', NULL),
(197, 'FAC-2026-0178', 31, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:48.597', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:48.597', '2026-10-17 06:48:48.597', NULL),
(198, 'FAC-2026-0179', 31, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:48.619', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:48.619', '2026-10-17 06:48:48.619', NULL),
(199, 'FAC-2026-0180', 31, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:48.642', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:48.642', '2026-10-17 06:48:48.642', NULL),
(200, 'FAC-2026-0181', 32, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:48.661', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:48.661', '2026-10-17 06:48:48.661', NULL),
(201, 'FAC-2026-0182', 32, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:48.680', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:48.680', '2026-10-17 06:48:48.680', NULL),
(202, 'FAC-2026-0183', 32, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:48.704', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:48.704', '2026-10-17 06:48:48.704', NULL),
(203, 'FAC-2026-0184', 32, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:48.726', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:48.726', '2026-10-17 06:48:48.726', NULL),
(204, 'FAC-2026-0185', 32, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:48.745', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:48.745', '2026-10-17 06:48:48.745', NULL),
(205, 'FAC-2026-0186', 32, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:48.781', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:48.781', '2026-10-17 06:48:48.781', NULL),
(206, 'FAC-2026-0187', 32, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:48.804', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:48.804', '2026-10-17 06:48:48.804', NULL),
(207, 'FAC-2026-0188', 32, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:48.825', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:48.825', '2026-10-17 06:48:48.825', NULL),
(208, 'FAC-2026-0189', 32, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:48.845', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:48.845', '2026-10-17 06:48:48.845', NULL),
(209, 'FAC-2026-0190', 33, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:48.868', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:48.868', '2026-10-17 06:48:48.868', NULL),
(210, 'FAC-2026-0191', 33, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:48.889', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:48.889', '2026-10-17 06:48:48.889', NULL),
(211, 'FAC-2026-0192', 33, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:48.912', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:48.912', '2026-10-17 06:48:48.912', NULL),
(212, 'FAC-2026-0193', 33, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:48.948', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:48.948', '2026-10-17 06:48:48.948', NULL),
(213, 'FAC-2026-0194', 33, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:48.980', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:48.980', '2026-10-17 06:48:48.980', NULL),
(214, 'FAC-2026-0195', 33, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:49.010', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:49.010', '2026-10-17 06:48:49.010', NULL),
(215, 'FAC-2026-0196', 33, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:49.030', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:49.030', '2026-10-17 06:48:49.030', NULL),
(216, 'FAC-2026-0197', 33, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:49.055', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:49.055', '2026-10-17 06:48:49.055', NULL),
(217, 'FAC-2026-0198', 33, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:49.076', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:49.076', '2026-10-17 06:48:49.076', NULL),
(218, 'FAC-2026-0199', 34, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:49.096', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:49.096', '2026-10-17 06:48:49.096', NULL),
(219, 'FAC-2026-0200', 34, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:49.122', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:49.122', '2026-10-17 06:48:49.122', NULL),
(220, 'FAC-2026-0201', 34, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:49.142', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:49.142', '2026-10-17 06:48:49.142', NULL),
(221, 'FAC-2026-0202', 34, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:49.161', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:49.161', '2026-10-17 06:48:49.161', NULL),
(222, 'FAC-2026-0203', 34, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:49.407', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:49.407', '2026-10-17 06:48:49.407', NULL),
(223, 'FAC-2026-0204', 34, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:49.439', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:49.439', '2026-10-17 06:48:49.439', NULL),
(224, 'FAC-2026-0205', 34, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:49.509', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:49.509', '2026-10-17 06:48:49.509', NULL),
(225, 'FAC-2026-0206', 34, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:49.528', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:49.528', '2026-10-17 06:48:49.528', NULL),
(226, 'FAC-2026-0207', 34, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:49.549', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:49.549', '2026-10-17 06:48:49.549', NULL),
(227, 'FAC-2026-0208', 35, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:49.573', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:49.573', '2026-10-17 06:48:49.573', NULL),
(228, 'FAC-2026-0209', 35, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:49.592', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:49.592', '2026-10-17 06:48:49.592', NULL),
(229, 'FAC-2026-0210', 35, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:49.612', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:49.612', '2026-10-17 06:48:49.612', NULL),
(230, 'FAC-2026-0211', 35, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:49.631', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:49.631', '2026-10-17 06:48:49.631', NULL),
(231, 'FAC-2026-0212', 35, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:49.654', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:49.654', '2026-10-17 06:48:49.654', NULL),
(232, 'FAC-2026-0213', 35, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:49.674', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:49.674', '2026-10-17 06:48:49.674', NULL),
(233, 'FAC-2026-0214', 35, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:49.695', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:49.695', '2026-10-17 06:48:49.695', NULL),
(234, 'FAC-2026-0215', 35, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:49.719', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:49.719', '2026-10-17 06:48:49.719', NULL),
(235, 'FAC-2026-0216', 35, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:49.740', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:49.740', '2026-10-17 06:48:49.740', NULL),
(236, 'FAC-2026-0217', 36, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:49.759', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:49.759', '2026-10-17 06:48:49.759', NULL),
(237, 'FAC-2026-0218', 36, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:49.779', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:49.779', '2026-10-17 06:48:49.779', NULL),
(238, 'FAC-2026-0219', 36, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:49.829', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:49.829', '2026-10-17 06:48:49.829', NULL),
(239, 'FAC-2026-0220', 36, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:49.878', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:49.878', '2026-10-17 06:48:49.878', NULL),
(240, 'FAC-2026-0221', 36, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:49.906', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:49.906', '2026-10-17 06:48:49.906', NULL),
(241, 'FAC-2026-0222', 36, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:49.957', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:49.957', '2026-10-17 06:48:49.957', NULL),
(242, 'FAC-2026-0223', 36, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:50.009', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:50.009', '2026-10-17 06:48:50.009', NULL),
(243, 'FAC-2026-0224', 36, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:50.048', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:50.048', '2026-10-17 06:48:50.048', NULL),
(244, 'FAC-2026-0225', 36, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:50.078', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:50.078', '2026-10-17 06:48:50.078', NULL),
(245, 'FAC-2026-0226', 37, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:50.104', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:50.104', '2026-10-17 06:48:50.104', NULL),
(246, 'FAC-2026-0227', 37, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:50.128', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:50.128', '2026-10-17 06:48:50.128', NULL);
INSERT INTO `invoices` (`id`, `reference`, `student_id`, `fee_id`, `enrollment_id`, `amount`, `paid_amount`, `currency`, `status`, `due_date`, `issued_at`, `notes`, `installment_no`, `created_at`, `updated_at`, `academic_year_id`) VALUES
(247, 'FAC-2026-0228', 37, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:50.157', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:50.157', '2026-10-17 06:48:50.157', NULL),
(248, 'FAC-2026-0229', 37, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:50.199', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:50.199', '2026-10-17 06:48:50.199', NULL),
(249, 'FAC-2026-0230', 37, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:50.232', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:50.232', '2026-10-17 06:48:50.232', NULL),
(250, 'FAC-2026-0231', 37, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:50.263', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:50.263', '2026-10-17 06:48:50.263', NULL),
(251, 'FAC-2026-0232', 37, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:50.291', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:50.291', '2026-10-17 06:48:50.291', NULL),
(252, 'FAC-2026-0233', 37, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:50.325', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:50.325', '2026-10-17 06:48:50.325', NULL),
(253, 'FAC-2026-0234', 37, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:50.359', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:50.359', '2026-10-17 06:48:50.359', NULL),
(254, 'FAC-2026-0235', 38, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:50.380', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:50.380', '2026-10-17 06:48:50.380', NULL),
(255, 'FAC-2026-0236', 38, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:50.413', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:50.413', '2026-10-17 06:48:50.413', NULL),
(256, 'FAC-2026-0237', 38, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:50.440', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:50.440', '2026-10-17 06:48:50.440', NULL),
(257, 'FAC-2026-0238', 38, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:50.472', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:50.472', '2026-10-17 06:48:50.472', NULL),
(258, 'FAC-2026-0239', 38, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:50.498', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:50.498', '2026-10-17 06:48:50.498', NULL),
(259, 'FAC-2026-0240', 38, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:50.524', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:50.524', '2026-10-17 06:48:50.524', NULL),
(260, 'FAC-2026-0241', 38, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:50.551', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:50.551', '2026-10-17 06:48:50.551', NULL),
(261, 'FAC-2026-0242', 38, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:50.611', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:50.611', '2026-10-17 06:48:50.611', NULL),
(262, 'FAC-2026-0243', 38, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:50.637', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:50.637', '2026-10-17 06:48:50.637', NULL),
(263, 'FAC-2026-0244', 39, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:50.658', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:50.658', '2026-10-17 06:48:50.658', NULL),
(264, 'FAC-2026-0245', 39, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:50.678', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:50.678', '2026-10-17 06:48:50.678', NULL),
(265, 'FAC-2026-0246', 39, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:50.706', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:50.706', '2026-10-17 06:48:50.706', NULL),
(266, 'FAC-2026-0247', 39, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:50.754', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:50.754', '2026-10-17 06:48:50.754', NULL),
(267, 'FAC-2026-0248', 39, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:50.777', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:50.777', '2026-10-17 06:48:50.777', NULL),
(268, 'FAC-2026-0249', 39, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:50.832', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:50.832', '2026-10-17 06:48:50.832', NULL),
(269, 'FAC-2026-0250', 39, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:50.863', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:50.863', '2026-10-17 06:48:50.863', NULL),
(270, 'FAC-2026-0251', 39, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:50.887', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:50.887', '2026-10-17 06:48:50.887', NULL),
(271, 'FAC-2026-0252', 39, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:50.908', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:50.908', '2026-10-17 06:48:50.908', NULL),
(272, 'FAC-2026-0253', 40, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:50.928', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:50.928', '2026-10-17 06:48:50.928', NULL),
(273, 'FAC-2026-0254', 40, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:50.949', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:50.949', '2026-10-17 06:48:50.949', NULL),
(274, 'FAC-2026-0255', 40, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:50.976', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:50.976', '2026-10-17 06:48:50.976', NULL),
(275, 'FAC-2026-0256', 40, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:51.004', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:51.004', '2026-10-17 06:48:51.004', NULL),
(276, 'FAC-2026-0257', 40, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:51.191', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:51.191', '2026-10-17 06:48:51.191', NULL),
(277, 'FAC-2026-0258', 40, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:51.270', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:51.270', '2026-10-17 06:48:51.270', NULL),
(278, 'FAC-2026-0259', 40, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:51.292', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:51.292', '2026-10-17 06:48:51.292', NULL),
(279, 'FAC-2026-0260', 40, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:51.357', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:51.357', '2026-10-17 06:48:51.357', NULL),
(280, 'FAC-2026-0261', 40, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:51.377', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:51.377', '2026-10-17 06:48:51.377', NULL),
(281, 'FAC-2026-0262', 41, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:51.396', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:51.396', '2026-10-17 06:48:51.396', NULL),
(282, 'FAC-2026-0263', 41, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:51.421', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:51.421', '2026-10-17 06:48:51.421', NULL),
(283, 'FAC-2026-0264', 41, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:51.445', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:51.445', '2026-10-17 06:48:51.445', NULL),
(284, 'FAC-2026-0265', 41, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:51.465', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:51.465', '2026-10-17 06:48:51.465', NULL),
(285, 'FAC-2026-0266', 41, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:51.491', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:51.491', '2026-10-17 06:48:51.491', NULL),
(286, 'FAC-2026-0267', 41, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:51.511', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:51.511', '2026-10-17 06:48:51.511', NULL),
(287, 'FAC-2026-0268', 41, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:51.537', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:51.537', '2026-10-17 06:48:51.537', NULL),
(288, 'FAC-2026-0269', 41, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:51.559', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:51.559', '2026-10-17 06:48:51.559', NULL),
(289, 'FAC-2026-0270', 41, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:51.578', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:51.578', '2026-10-17 06:48:51.578', NULL),
(290, 'FAC-2026-0271', 42, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:51.599', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:51.599', '2026-10-17 06:48:51.599', NULL),
(291, 'FAC-2026-0272', 42, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:51.621', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:51.621', '2026-10-17 06:48:51.621', NULL),
(292, 'FAC-2026-0273', 42, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:51.641', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:51.641', '2026-10-17 06:48:51.641', NULL),
(293, 'FAC-2026-0274', 42, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:51.661', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:51.661', '2026-10-17 06:48:51.661', NULL),
(294, 'FAC-2026-0275', 42, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:51.680', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:51.680', '2026-10-17 06:48:51.680', NULL),
(295, 'FAC-2026-0276', 42, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:51.703', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:51.703', '2026-10-17 06:48:51.703', NULL),
(296, 'FAC-2026-0277', 42, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:51.724', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:51.724', '2026-10-17 06:48:51.724', NULL),
(297, 'FAC-2026-0278', 42, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:51.744', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:51.744', '2026-10-17 06:48:51.744', NULL),
(298, 'FAC-2026-0279', 42, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:51.763', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:51.763', '2026-10-17 06:48:51.763', NULL),
(299, 'FAC-2026-0280', 43, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:51.789', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:51.789', '2026-10-17 06:48:51.789', NULL),
(300, 'FAC-2026-0281', 43, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:51.810', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:51.810', '2026-10-17 06:48:51.810', NULL),
(301, 'FAC-2026-0282', 43, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:51.830', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:51.830', '2026-10-17 06:48:51.830', NULL),
(302, 'FAC-2026-0283', 43, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:51.855', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:51.855', '2026-10-17 06:48:51.855', NULL),
(303, 'FAC-2026-0284', 43, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:51.876', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:51.876', '2026-10-17 06:48:51.876', NULL),
(304, 'FAC-2026-0285', 43, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:51.894', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:51.894', '2026-10-17 06:48:51.894', NULL),
(305, 'FAC-2026-0286', 43, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:51.916', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:51.916', '2026-10-17 06:48:51.916', NULL),
(306, 'FAC-2026-0287', 43, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:51.937', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:51.937', '2026-10-17 06:48:51.937', NULL),
(307, 'FAC-2026-0288', 43, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:51.959', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:51.959', '2026-10-17 06:48:51.959', NULL),
(308, 'FAC-2026-0289', 44, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:51.978', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:51.978', '2026-10-17 06:48:51.978', NULL),
(309, 'FAC-2026-0290', 44, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:52.007', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:52.007', '2026-10-17 06:48:52.007', NULL),
(310, 'FAC-2026-0291', 44, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:52.029', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:52.029', '2026-10-17 06:48:52.029', NULL),
(311, 'FAC-2026-0292', 44, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:52.055', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:52.055', '2026-10-17 06:48:52.055', NULL),
(312, 'FAC-2026-0293', 44, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:52.077', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:52.077', '2026-10-17 06:48:52.077', NULL),
(313, 'FAC-2026-0294', 44, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:52.097', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:52.097', '2026-10-17 06:48:52.097', NULL),
(314, 'FAC-2026-0295', 44, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:52.120', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:52.120', '2026-10-17 06:48:52.120', NULL),
(315, 'FAC-2026-0296', 44, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:52.146', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:52.146', '2026-10-17 06:48:52.146', NULL),
(316, 'FAC-2026-0297', 44, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:52.173', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:52.173', '2026-10-17 06:48:52.173', NULL),
(317, 'FAC-2026-0298', 45, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:52.194', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:52.194', '2026-10-17 06:48:52.194', NULL),
(318, 'FAC-2026-0299', 45, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:52.215', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:52.215', '2026-10-17 06:48:52.215', NULL),
(319, 'FAC-2026-0300', 45, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:52.237', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:52.237', '2026-10-17 06:48:52.237', NULL),
(320, 'FAC-2026-0301', 45, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:52.259', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:52.259', '2026-10-17 06:48:52.259', NULL),
(321, 'FAC-2026-0302', 45, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:52.278', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:52.278', '2026-10-17 06:48:52.278', NULL),
(322, 'FAC-2026-0303', 45, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:52.302', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:52.302', '2026-10-17 06:48:52.302', NULL),
(323, 'FAC-2026-0304', 45, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:52.325', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:52.325', '2026-10-17 06:48:52.325', NULL),
(324, 'FAC-2026-0305', 45, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:52.345', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:52.345', '2026-10-17 06:48:52.345', NULL),
(325, 'FAC-2026-0306', 45, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:52.368', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:52.368', '2026-10-17 06:48:52.368', NULL),
(326, 'FAC-2026-0307', 46, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:52.390', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:52.390', '2026-10-17 06:48:52.390', NULL),
(327, 'FAC-2026-0308', 46, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:52.410', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:52.410', '2026-10-17 06:48:52.410', NULL),
(328, 'FAC-2026-0309', 46, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:52.429', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:52.429', '2026-10-17 06:48:52.429', NULL),
(329, 'FAC-2026-0310', 46, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:52.449', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:52.449', '2026-10-17 06:48:52.449', NULL),
(330, 'FAC-2026-0311', 46, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:52.472', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:52.472', '2026-10-17 06:48:52.472', NULL),
(331, 'FAC-2026-0312', 46, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:52.713', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:52.713', '2026-10-17 06:48:52.713', NULL),
(332, 'FAC-2026-0313', 46, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:52.755', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:52.755', '2026-10-17 06:48:52.755', NULL),
(333, 'FAC-2026-0314', 46, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:52.795', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:52.795', '2026-10-17 06:48:52.795', NULL),
(334, 'FAC-2026-0315', 46, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:52.829', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:52.829', '2026-10-17 06:48:52.829', NULL),
(335, 'FAC-2026-0316', 47, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:52.850', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:52.850', '2026-10-17 06:48:52.850', NULL),
(336, 'FAC-2026-0317', 47, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:52.877', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:52.877', '2026-10-17 06:48:52.877', NULL),
(337, 'FAC-2026-0318', 47, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:52.913', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:52.913', '2026-10-17 06:48:52.913', NULL),
(338, 'FAC-2026-0319', 47, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:52.937', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:52.937', '2026-10-17 06:48:52.937', NULL),
(339, 'FAC-2026-0320', 47, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:52.965', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:52.965', '2026-10-17 06:48:52.965', NULL),
(340, 'FAC-2026-0321', 47, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:52.989', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:52.989', '2026-10-17 06:48:52.989', NULL),
(341, 'FAC-2026-0322', 47, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:53.017', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:53.017', '2026-10-17 06:48:53.017', NULL),
(342, 'FAC-2026-0323', 47, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:53.042', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:53.042', '2026-10-17 06:48:53.042', NULL),
(343, 'FAC-2026-0324', 47, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:53.061', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:53.061', '2026-10-17 06:48:53.061', NULL),
(344, 'FAC-2026-0325', 48, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:53.095', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:53.095', '2026-10-17 06:48:53.095', NULL),
(345, 'FAC-2026-0326', 48, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:53.117', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:53.117', '2026-10-17 06:48:53.117', NULL),
(346, 'FAC-2026-0327', 48, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:53.142', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:53.142', '2026-10-17 06:48:53.142', NULL),
(347, 'FAC-2026-0328', 48, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:53.162', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:53.162', '2026-10-17 06:48:53.162', NULL),
(348, 'FAC-2026-0329', 48, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:53.187', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:53.187', '2026-10-17 06:48:53.187', NULL),
(349, 'FAC-2026-0330', 48, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:53.208', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:53.208', '2026-10-17 06:48:53.208', NULL),
(350, 'FAC-2026-0331', 48, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:53.228', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:53.228', '2026-10-17 06:48:53.228', NULL),
(351, 'FAC-2026-0332', 48, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:53.254', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:53.254', '2026-10-17 06:48:53.254', NULL),
(352, 'FAC-2026-0333', 48, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:53.273', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:53.273', '2026-10-17 06:48:53.273', NULL),
(353, 'FAC-2026-0334', 49, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:53.294', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:53.294', '2026-10-17 06:48:53.294', NULL),
(354, 'FAC-2026-0335', 49, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:53.314', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:53.314', '2026-10-17 06:48:53.314', NULL),
(355, 'FAC-2026-0336', 49, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:53.341', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:53.341', '2026-10-17 06:48:53.341', NULL),
(356, 'FAC-2026-0337', 49, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:53.360', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:53.360', '2026-10-17 06:48:53.360', NULL),
(357, 'FAC-2026-0338', 49, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:53.379', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:53.379', '2026-10-17 06:48:53.379', NULL),
(358, 'FAC-2026-0339', 49, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:53.407', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:53.407', '2026-10-17 06:48:53.407', NULL),
(359, 'FAC-2026-0340', 49, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:53.426', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:53.426', '2026-10-17 06:48:53.426', NULL),
(360, 'FAC-2026-0341', 49, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:53.447', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:53.447', '2026-10-17 06:48:53.447', NULL),
(361, 'FAC-2026-0342', 49, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:53.471', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:53.471', '2026-10-17 06:48:53.471', NULL),
(362, 'FAC-2026-0343', 50, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:53.492', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:53.492', '2026-10-17 06:48:53.492', NULL),
(363, 'FAC-2026-0344', 50, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:53.513', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:53.513', '2026-10-17 06:48:53.513', NULL),
(364, 'FAC-2026-0345', 50, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:53.539', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:53.539', '2026-10-17 06:48:53.539', NULL),
(365, 'FAC-2026-0346', 50, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:53.561', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:53.561', '2026-10-17 06:48:53.561', NULL),
(366, 'FAC-2026-0347', 50, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:53.580', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:53.580', '2026-10-17 06:48:53.580', NULL),
(367, 'FAC-2026-0348', 50, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:53.604', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:53.604', '2026-10-17 06:48:53.604', NULL),
(368, 'FAC-2026-0349', 50, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:53.626', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:53.626', '2026-10-17 06:48:53.626', NULL),
(369, 'FAC-2026-0350', 50, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:53.645', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:53.645', '2026-10-17 06:48:53.645', NULL),
(370, 'FAC-2026-0351', 50, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:53.670', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:53.670', '2026-10-17 06:48:53.670', NULL),
(371, 'FAC-2026-0352', 51, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:53.691', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:53.691', '2026-10-17 06:48:53.691', NULL),
(372, 'FAC-2026-0353', 51, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:53.710', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:53.710', '2026-10-17 06:48:53.710', NULL),
(373, 'FAC-2026-0354', 51, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:53.729', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:53.729', '2026-10-17 06:48:53.729', NULL),
(374, 'FAC-2026-0355', 51, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:53.755', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:53.755', '2026-10-17 06:48:53.755', NULL),
(375, 'FAC-2026-0356', 51, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:53.779', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:53.779', '2026-10-17 06:48:53.779', NULL),
(376, 'FAC-2026-0357', 51, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:53.852', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:53.852', '2026-10-17 06:48:53.852', NULL),
(377, 'FAC-2026-0358', 51, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:53.875', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:53.875', '2026-10-17 06:48:53.875', NULL),
(378, 'FAC-2026-0359', 51, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:53.895', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:53.895', '2026-10-17 06:48:53.895', NULL),
(379, 'FAC-2026-0360', 51, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:53.968', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:53.968', '2026-10-17 06:48:53.968', NULL),
(380, 'FAC-2026-0361', 52, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:53.991', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:53.991', '2026-10-17 06:48:53.991', NULL),
(381, 'FAC-2026-0362', 52, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:54.011', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:54.011', '2026-10-17 06:48:54.011', NULL),
(382, 'FAC-2026-0363', 52, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:54.041', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:54.041', '2026-10-17 06:48:54.041', NULL),
(383, 'FAC-2026-0364', 52, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:54.061', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:54.061', '2026-10-17 06:48:54.061', NULL),
(384, 'FAC-2026-0365', 52, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:54.088', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:54.088', '2026-10-17 06:48:54.088', NULL),
(385, 'FAC-2026-0366', 52, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:54.192', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:54.192', '2026-10-17 06:48:54.192', NULL),
(386, 'FAC-2026-0367', 52, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:54.358', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:54.358', '2026-10-17 06:48:54.358', NULL),
(387, 'FAC-2026-0368', 52, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:54.379', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:54.379', '2026-10-17 06:48:54.379', NULL),
(388, 'FAC-2026-0369', 52, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:54.443', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:54.443', '2026-10-17 06:48:54.443', NULL),
(389, 'FAC-2026-0370', 53, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:54.462', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:54.462', '2026-10-17 06:48:54.462', NULL),
(390, 'FAC-2026-0371', 53, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:54.487', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:54.487', '2026-10-17 06:48:54.487', NULL),
(391, 'FAC-2026-0372', 53, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:54.506', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:54.506', '2026-10-17 06:48:54.506', NULL),
(392, 'FAC-2026-0373', 53, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:54.535', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:54.535', '2026-10-17 06:48:54.535', NULL),
(393, 'FAC-2026-0374', 53, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:54.558', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:54.558', '2026-10-17 06:48:54.558', NULL),
(394, 'FAC-2026-0375', 53, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:54.577', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:54.577', '2026-10-17 06:48:54.577', NULL),
(395, 'FAC-2026-0376', 53, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:54.599', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:54.599', '2026-10-17 06:48:54.599', NULL),
(396, 'FAC-2026-0377', 53, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:54.621', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:54.621', '2026-10-17 06:48:54.621', NULL),
(397, 'FAC-2026-0378', 53, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:54.641', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:54.641', '2026-10-17 06:48:54.641', NULL),
(398, 'FAC-2026-0379', 54, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:54.662', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:54.662', '2026-10-17 06:48:54.662', NULL),
(399, 'FAC-2026-0380', 54, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:54.687', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:54.687', '2026-10-17 06:48:54.687', NULL),
(400, 'FAC-2026-0381', 54, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:54.708', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:54.708', '2026-10-17 06:48:54.708', NULL),
(401, 'FAC-2026-0382', 54, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:54.728', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:54.728', '2026-10-17 06:48:54.728', NULL),
(402, 'FAC-2026-0383', 54, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:54.749', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:54.749', '2026-10-17 06:48:54.749', NULL),
(403, 'FAC-2026-0384', 54, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:54.771', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:54.771', '2026-10-17 06:48:54.771', NULL),
(404, 'FAC-2026-0385', 54, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:54.793', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:54.793', '2026-10-17 06:48:54.793', NULL),
(405, 'FAC-2026-0386', 54, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:54.813', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:54.813', '2026-10-17 06:48:54.813', NULL),
(406, 'FAC-2026-0387', 54, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:54.836', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:54.836', '2026-10-17 06:48:54.836', NULL),
(407, 'FAC-2026-0388', 55, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:54.859', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:54.859', '2026-10-17 06:48:54.859', NULL),
(408, 'FAC-2026-0389', 55, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:54.878', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:54.878', '2026-10-17 06:48:54.878', NULL),
(409, 'FAC-2026-0390', 55, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:54.903', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:54.903', '2026-10-17 06:48:54.903', NULL),
(410, 'FAC-2026-0391', 55, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:54.925', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:54.925', '2026-10-17 06:48:54.925', NULL),
(411, 'FAC-2026-0392', 55, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:54.946', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:54.946', '2026-10-17 06:48:54.946', NULL),
(412, 'FAC-2026-0393', 55, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:54.975', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:54.975', '2026-10-17 06:48:54.975', NULL),
(413, 'FAC-2026-0394', 55, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:54.996', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:54.996', '2026-10-17 06:48:54.996', NULL),
(414, 'FAC-2026-0395', 55, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:55.020', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:55.020', '2026-10-17 06:48:55.020', NULL),
(415, 'FAC-2026-0396', 55, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:55.044', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:55.044', '2026-10-17 06:48:55.044', NULL),
(416, 'FAC-2026-0397', 56, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:55.070', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:55.070', '2026-10-17 06:48:55.070', NULL),
(417, 'FAC-2026-0398', 56, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:55.091', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:55.091', '2026-10-17 06:48:55.091', NULL),
(418, 'FAC-2026-0399', 56, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:55.110', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:55.110', '2026-10-17 06:48:55.110', NULL),
(419, 'FAC-2026-0400', 56, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:55.133', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:55.133', '2026-10-17 06:48:55.133', NULL),
(420, 'FAC-2026-0401', 56, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:55.156', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:55.156', '2026-10-17 06:48:55.156', NULL),
(421, 'FAC-2026-0402', 56, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:55.176', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:55.176', '2026-10-17 06:48:55.176', NULL),
(422, 'FAC-2026-0403', 56, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:55.196', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:55.196', '2026-10-17 06:48:55.196', NULL),
(423, 'FAC-2026-0404', 56, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:55.220', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:55.220', '2026-10-17 06:48:55.220', NULL),
(424, 'FAC-2026-0405', 56, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:55.242', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:55.242', '2026-10-17 06:48:55.242', NULL),
(425, 'FAC-2026-0406', 57, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:55.262', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:55.262', '2026-10-17 06:48:55.262', NULL),
(426, 'FAC-2026-0407', 57, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:55.286', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:55.286', '2026-10-17 06:48:55.286', NULL),
(427, 'FAC-2026-0408', 57, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:55.309', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:55.309', '2026-10-17 06:48:55.309', NULL),
(428, 'FAC-2026-0409', 57, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:55.327', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:55.327', '2026-10-17 06:48:55.327', NULL),
(429, 'FAC-2026-0410', 57, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:55.347', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:55.347', '2026-10-17 06:48:55.347', NULL),
(430, 'FAC-2026-0411', 57, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:55.365', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:55.365', '2026-10-17 06:48:55.365', NULL),
(431, 'FAC-2026-0412', 57, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:55.390', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:55.390', '2026-10-17 06:48:55.390', NULL),
(432, 'FAC-2026-0413', 57, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:55.413', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:55.413', '2026-10-17 06:48:55.413', NULL),
(433, 'FAC-2026-0414', 57, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:55.443', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:55.443', '2026-10-17 06:48:55.443', NULL),
(434, 'FAC-2026-0415', 58, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:55.462', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:55.462', '2026-10-17 06:48:55.462', NULL),
(435, 'FAC-2026-0416', 58, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:55.485', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:55.485', '2026-10-17 06:48:55.485', NULL),
(436, 'FAC-2026-0417', 58, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:55.508', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:55.508', '2026-10-17 06:48:55.508', NULL),
(437, 'FAC-2026-0418', 58, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:55.527', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:55.527', '2026-10-17 06:48:55.527', NULL),
(438, 'FAC-2026-0419', 58, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:55.548', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:55.548', '2026-10-17 06:48:55.548', NULL),
(439, 'FAC-2026-0420', 58, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:55.576', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:55.576', '2026-10-17 06:48:55.576', NULL),
(440, 'FAC-2026-0421', 58, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:55.595', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:55.595', '2026-10-17 06:48:55.595', NULL),
(441, 'FAC-2026-0422', 58, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:55.615', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:55.615', '2026-10-17 06:48:55.615', NULL),
(442, 'FAC-2026-0423', 58, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:55.638', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:55.638', '2026-10-17 06:48:55.638', NULL),
(443, 'FAC-2026-0424', 59, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:55.658', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:55.658', '2026-10-17 06:48:55.658', NULL),
(444, 'FAC-2026-0425', 59, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:55.783', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:55.783', '2026-10-17 06:48:55.783', NULL),
(445, 'FAC-2026-0426', 59, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:55.929', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:55.929', '2026-10-17 06:48:55.929', NULL),
(446, 'FAC-2026-0427', 59, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:55.969', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:55.969', '2026-10-17 06:48:55.969', NULL),
(447, 'FAC-2026-0428', 59, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:56.014', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:56.014', '2026-10-17 06:48:56.014', NULL),
(448, 'FAC-2026-0429', 59, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:56.037', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:56.037', '2026-10-17 06:48:56.037', NULL),
(449, 'FAC-2026-0430', 59, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:56.060', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:56.060', '2026-10-17 06:48:56.060', NULL),
(450, 'FAC-2026-0431', 59, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:56.085', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:56.085', '2026-10-17 06:48:56.085', NULL),
(451, 'FAC-2026-0432', 59, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:56.108', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:56.108', '2026-10-17 06:48:56.108', NULL),
(452, 'FAC-2026-0433', 60, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:56.128', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:56.128', '2026-10-17 06:48:56.128', NULL),
(453, 'FAC-2026-0434', 60, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:56.148', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:56.148', '2026-10-17 06:48:56.148', NULL),
(454, 'FAC-2026-0435', 60, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:56.171', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:56.171', '2026-10-17 06:48:56.171', NULL),
(455, 'FAC-2026-0436', 60, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:56.191', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:56.191', '2026-10-17 06:48:56.191', NULL),
(456, 'FAC-2026-0437', 60, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:56.211', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:56.211', '2026-10-17 06:48:56.211', NULL),
(457, 'FAC-2026-0438', 60, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:56.239', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:56.239', '2026-10-17 06:48:56.239', NULL),
(458, 'FAC-2026-0439', 60, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:56.263', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:56.263', '2026-10-17 06:48:56.263', NULL),
(459, 'FAC-2026-0440', 60, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:56.286', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:56.286', '2026-10-17 06:48:56.286', NULL),
(460, 'FAC-2026-0441', 60, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:56.308', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:56.308', '2026-10-17 06:48:56.308', NULL),
(461, 'FAC-2026-0442', 61, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:56.327', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:56.327', '2026-10-17 06:48:56.327', NULL),
(462, 'FAC-2026-0443', 61, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:56.346', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:56.346', '2026-10-17 06:48:56.346', NULL),
(463, 'FAC-2026-0444', 61, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:56.368', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:56.368', '2026-10-17 06:48:56.368', NULL),
(464, 'FAC-2026-0445', 61, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:56.391', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:56.391', '2026-10-17 06:48:56.391', NULL),
(465, 'FAC-2026-0446', 61, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:56.410', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:56.410', '2026-10-17 06:48:56.410', NULL),
(466, 'FAC-2026-0447', 61, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:56.429', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:56.429', '2026-10-17 06:48:56.429', NULL),
(467, 'FAC-2026-0448', 61, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:56.458', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:56.458', '2026-10-17 06:48:56.458', NULL),
(468, 'FAC-2026-0449', 61, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:56.478', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:56.478', '2026-10-17 06:48:56.478', NULL),
(469, 'FAC-2026-0450', 61, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:56.503', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:56.503', '2026-10-17 06:48:56.503', NULL),
(470, 'FAC-2026-0451', 62, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:56.526', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:56.526', '2026-10-17 06:48:56.526', NULL),
(471, 'FAC-2026-0452', 62, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:56.545', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:56.545', '2026-10-17 06:48:56.545', NULL),
(472, 'FAC-2026-0453', 62, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:56.571', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:56.571', '2026-10-17 06:48:56.571', NULL),
(473, 'FAC-2026-0454', 62, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:56.592', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:56.592', '2026-10-17 06:48:56.592', NULL),
(474, 'FAC-2026-0455', 62, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:56.610', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:56.610', '2026-10-17 06:48:56.610', NULL);
INSERT INTO `invoices` (`id`, `reference`, `student_id`, `fee_id`, `enrollment_id`, `amount`, `paid_amount`, `currency`, `status`, `due_date`, `issued_at`, `notes`, `installment_no`, `created_at`, `updated_at`, `academic_year_id`) VALUES
(475, 'FAC-2026-0456', 62, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:56.629', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:56.629', '2026-10-17 06:48:56.629', NULL),
(476, 'FAC-2026-0457', 62, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:56.647', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:56.647', '2026-10-17 06:48:56.647', NULL),
(477, 'FAC-2026-0458', 62, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:56.671', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:56.671', '2026-10-17 06:48:56.671', NULL),
(478, 'FAC-2026-0459', 62, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:56.692', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:56.692', '2026-10-17 06:48:56.692', NULL),
(479, 'FAC-2026-0460', 63, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:56.711', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:56.711', '2026-10-17 06:48:56.711', NULL),
(480, 'FAC-2026-0461', 63, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:56.734', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:56.734', '2026-10-17 06:48:56.734', NULL),
(481, 'FAC-2026-0462', 63, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:56.754', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:56.754', '2026-10-17 06:48:56.754', NULL),
(482, 'FAC-2026-0463', 63, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:56.775', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:56.775', '2026-10-17 06:48:56.775', NULL),
(483, 'FAC-2026-0464', 63, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:56.794', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:56.794', '2026-10-17 06:48:56.794', NULL),
(484, 'FAC-2026-0465', 63, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:56.813', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:56.813', '2026-10-17 06:48:56.813', NULL),
(485, 'FAC-2026-0466', 63, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:56.838', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:56.838', '2026-10-17 06:48:56.838', NULL),
(486, 'FAC-2026-0467', 63, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:56.859', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:56.859', '2026-10-17 06:48:56.859', NULL),
(487, 'FAC-2026-0468', 63, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:56.880', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:56.880', '2026-10-17 06:48:56.880', NULL),
(488, 'FAC-2026-0469', 64, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:56.904', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:56.904', '2026-10-17 06:48:56.904', NULL),
(489, 'FAC-2026-0470', 64, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:56.952', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:56.952', '2026-10-17 06:48:56.952', NULL),
(490, 'FAC-2026-0471', 64, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:56.978', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:56.978', '2026-10-17 06:48:56.978', NULL),
(491, 'FAC-2026-0472', 64, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:56.997', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:56.997', '2026-10-17 06:48:56.997', NULL),
(492, 'FAC-2026-0473', 64, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:57.020', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:57.020', '2026-10-17 06:48:57.020', NULL),
(493, 'FAC-2026-0474', 64, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:57.041', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:57.041', '2026-10-17 06:48:57.041', NULL),
(494, 'FAC-2026-0475', 64, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:57.061', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:57.061', '2026-10-17 06:48:57.061', NULL),
(495, 'FAC-2026-0476', 64, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:57.091', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:57.091', '2026-10-17 06:48:57.091', NULL),
(496, 'FAC-2026-0477', 64, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:57.111', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:57.111', '2026-10-17 06:48:57.111', NULL),
(497, 'FAC-2026-0478', 65, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:57.136', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:57.136', '2026-10-17 06:48:57.136', NULL),
(498, 'FAC-2026-0479', 65, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:57.159', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:57.159', '2026-10-17 06:48:57.159', NULL),
(499, 'FAC-2026-0480', 65, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:57.215', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:57.215', '2026-10-17 06:48:57.215', NULL),
(500, 'FAC-2026-0481', 65, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:57.499', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:57.499', '2026-10-17 06:48:57.499', NULL),
(501, 'FAC-2026-0482', 65, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:57.527', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:57.527', '2026-10-17 06:48:57.527', NULL),
(502, 'FAC-2026-0483', 65, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:57.595', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:57.595', '2026-10-17 06:48:57.595', NULL),
(503, 'FAC-2026-0484', 65, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:57.627', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:57.627', '2026-10-17 06:48:57.627', NULL),
(504, 'FAC-2026-0485', 65, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:57.656', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:57.656', '2026-10-17 06:48:57.656', NULL),
(505, 'FAC-2026-0486', 65, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:57.675', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:57.675', '2026-10-17 06:48:57.675', NULL),
(506, 'FAC-2026-0487', 66, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:57.694', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:57.694', '2026-10-17 06:48:57.694', NULL),
(507, 'FAC-2026-0488', 66, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:57.713', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:57.713', '2026-10-17 06:48:57.713', NULL),
(508, 'FAC-2026-0489', 66, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:57.736', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:57.736', '2026-10-17 06:48:57.736', NULL),
(509, 'FAC-2026-0490', 66, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:57.757', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:57.757', '2026-10-17 06:48:57.757', NULL),
(510, 'FAC-2026-0491', 66, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:57.775', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:57.775', '2026-10-17 06:48:57.775', NULL),
(511, 'FAC-2026-0492', 66, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:57.796', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:57.796', '2026-10-17 06:48:57.796', NULL),
(512, 'FAC-2026-0493', 66, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:57.820', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:57.820', '2026-10-17 06:48:57.820', NULL),
(513, 'FAC-2026-0494', 66, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:57.841', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:57.841', '2026-10-17 06:48:57.841', NULL),
(514, 'FAC-2026-0495', 66, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:57.860', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:57.860', '2026-10-17 06:48:57.860', NULL),
(515, 'FAC-2026-0496', 67, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:57.880', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:57.880', '2026-10-17 06:48:57.880', NULL),
(516, 'FAC-2026-0497', 67, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:57.898', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:57.898', '2026-10-17 06:48:57.898', NULL),
(517, 'FAC-2026-0498', 67, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:57.923', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:57.923', '2026-10-17 06:48:57.923', NULL),
(518, 'FAC-2026-0499', 67, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:57.942', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:57.942', '2026-10-17 06:48:57.942', NULL),
(519, 'FAC-2026-0500', 67, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:57.962', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:57.962', '2026-10-17 06:48:57.962', NULL),
(520, 'FAC-2026-0501', 67, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:57.987', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:57.987', '2026-10-17 06:48:57.987', NULL),
(521, 'FAC-2026-0502', 67, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:58.055', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:58.055', '2026-10-17 06:48:58.055', NULL),
(522, 'FAC-2026-0503', 67, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:58.074', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:58.074', '2026-10-17 06:48:58.074', NULL),
(523, 'FAC-2026-0504', 67, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:58.096', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:58.096', '2026-10-17 06:48:58.096', NULL),
(524, 'FAC-2026-0505', 68, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:58.123', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:58.123', '2026-10-17 06:48:58.123', NULL),
(525, 'FAC-2026-0506', 68, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:58.146', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:58.146', '2026-10-17 06:48:58.146', NULL),
(526, 'FAC-2026-0507', 68, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:58.170', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:58.170', '2026-10-17 06:48:58.170', NULL),
(527, 'FAC-2026-0508', 68, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:58.192', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:58.192', '2026-10-17 06:48:58.192', NULL),
(528, 'FAC-2026-0509', 68, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:58.211', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:58.211', '2026-10-17 06:48:58.211', NULL),
(529, 'FAC-2026-0510', 68, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:58.238', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:58.238', '2026-10-17 06:48:58.238', NULL),
(530, 'FAC-2026-0511', 68, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:58.261', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:58.261', '2026-10-17 06:48:58.261', NULL),
(531, 'FAC-2026-0512', 68, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:58.280', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:58.280', '2026-10-17 06:48:58.280', NULL),
(532, 'FAC-2026-0513', 68, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:58.307', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:58.307', '2026-10-17 06:48:58.307', NULL),
(533, 'FAC-2026-0514', 69, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:58.328', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:58.328', '2026-10-17 06:48:58.328', NULL),
(534, 'FAC-2026-0515', 69, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:58.346', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:58.346', '2026-10-17 06:48:58.346', NULL),
(535, 'FAC-2026-0516', 69, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:58.374', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:58.374', '2026-10-17 06:48:58.374', NULL),
(536, 'FAC-2026-0517', 69, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:58.397', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:58.397', '2026-10-17 06:48:58.397', NULL),
(537, 'FAC-2026-0518', 69, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:58.422', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:58.422', '2026-10-17 06:48:58.422', NULL),
(538, 'FAC-2026-0519', 69, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:58.442', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:58.442', '2026-10-17 06:48:58.442', NULL),
(539, 'FAC-2026-0520', 69, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:58.462', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:58.462', '2026-10-17 06:48:58.462', NULL),
(540, 'FAC-2026-0521', 69, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:58.488', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:58.488', '2026-10-17 06:48:58.488', NULL),
(541, 'FAC-2026-0522', 69, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:58.510', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:58.510', '2026-10-17 06:48:58.510', NULL),
(542, 'FAC-2026-0523', 70, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:58.529', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:58.529', '2026-10-17 06:48:58.529', NULL),
(543, 'FAC-2026-0524', 70, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:58.554', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:58.554', '2026-10-17 06:48:58.554', NULL),
(544, 'FAC-2026-0525', 70, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:58.576', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:58.576', '2026-10-17 06:48:58.576', NULL),
(545, 'FAC-2026-0526', 70, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:58.595', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:58.595', '2026-10-17 06:48:58.595', NULL),
(546, 'FAC-2026-0527', 70, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:58.627', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:58.627', '2026-10-17 06:48:58.627', NULL),
(547, 'FAC-2026-0528', 70, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:58.647', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:58.647', '2026-10-17 06:48:58.647', NULL),
(548, 'FAC-2026-0529', 70, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:58.671', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:58.671', '2026-10-17 06:48:58.671', NULL),
(549, 'FAC-2026-0530', 70, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:58.692', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:58.692', '2026-10-17 06:48:58.692', NULL),
(550, 'FAC-2026-0531', 70, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:58.712', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:58.712', '2026-10-17 06:48:58.712', NULL),
(551, 'FAC-2026-0532', 71, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-10-04 21:00:00.000', '2026-10-17 06:48:58.745', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:58.745', '2026-10-17 06:48:58.745', NULL),
(552, 'FAC-2026-0533', 71, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:58.771', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:58.771', '2026-10-17 06:48:58.771', NULL),
(553, 'FAC-2026-0534', 71, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:58.792', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:58.792', '2026-10-17 06:48:58.792', NULL),
(554, 'FAC-2026-0535', 71, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:59.004', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:59.004', '2026-10-17 06:48:59.004', NULL),
(555, 'FAC-2026-0536', 71, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:59.083', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:59.083', '2026-10-17 06:48:59.083', NULL),
(556, 'FAC-2026-0537', 71, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:59.158', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:59.158', '2026-10-17 06:48:59.158', NULL),
(557, 'FAC-2026-0538', 71, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:59.177', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:59.177', '2026-10-17 06:48:59.177', NULL),
(558, 'FAC-2026-0539', 71, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:59.201', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:59.201', '2026-10-17 06:48:59.201', NULL),
(559, 'FAC-2026-0540', 71, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:59.225', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:59.225', '2026-10-17 06:48:59.225', NULL),
(560, 'FAC-2026-0541', 72, 1, NULL, 166666.67, 166666.00, 'MGA', 'OVERDUE', '2025-10-04 21:00:00.000', '2026-10-17 06:48:59.246', 'Frais de scolarit� — Mois 1/9', 1, '2026-10-17 06:48:59.246', '2026-10-17 06:51:28.846', NULL),
(561, 'FAC-2026-0542', 72, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-11-04 21:00:00.000', '2026-10-17 06:48:59.271', 'Frais de scolarit� — Mois 2/9', 2, '2026-10-17 06:48:59.271', '2026-10-17 06:48:59.271', NULL),
(562, 'FAC-2026-0543', 72, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2025-12-04 21:00:00.000', '2026-10-17 06:48:59.290', 'Frais de scolarit� — Mois 3/9', 3, '2026-10-17 06:48:59.290', '2026-10-17 06:48:59.290', NULL),
(563, 'FAC-2026-0544', 72, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-01-04 21:00:00.000', '2026-10-17 06:48:59.309', 'Frais de scolarit� — Mois 4/9', 4, '2026-10-17 06:48:59.309', '2026-10-17 06:48:59.309', NULL),
(564, 'FAC-2026-0545', 72, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-02-04 21:00:00.000', '2026-10-17 06:48:59.329', 'Frais de scolarit� — Mois 5/9', 5, '2026-10-17 06:48:59.329', '2026-10-17 06:48:59.329', NULL),
(565, 'FAC-2026-0546', 72, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-03-04 21:00:00.000', '2026-10-17 06:48:59.357', 'Frais de scolarit� — Mois 6/9', 6, '2026-10-17 06:48:59.357', '2026-10-17 06:48:59.357', NULL),
(566, 'FAC-2026-0547', 72, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-04-04 21:00:00.000', '2026-10-17 06:48:59.380', 'Frais de scolarit� — Mois 7/9', 7, '2026-10-17 06:48:59.380', '2026-10-17 06:48:59.380', NULL),
(567, 'FAC-2026-0548', 72, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-05-04 21:00:00.000', '2026-10-17 06:48:59.405', 'Frais de scolarit� — Mois 8/9', 8, '2026-10-17 06:48:59.405', '2026-10-17 06:48:59.405', NULL),
(568, 'FAC-2026-0549', 72, 1, NULL, 166666.67, 0.00, 'MGA', 'DRAFT', '2026-06-04 21:00:00.000', '2026-10-17 06:48:59.425', 'Frais de scolarit� — Mois 9/9', 9, '2026-10-17 06:48:59.425', '2026-10-17 06:48:59.425', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` enum('MATERIAL_EXPIRING','MATERIAL_EXPIRING_URGENT','MATERIAL_EXPIRED','MATERIAL_EXTENDED','MATERIAL_DELETED','COURSE_ANNOUNCEMENT','GRADE_PUBLISHED','ENROLLMENT','SYSTEM') NOT NULL,
  `title` varchar(191) NOT NULL,
  `message` text NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `channel` enum('IN_APP','EMAIL','SMS') NOT NULL DEFAULT 'IN_APP',
  `status` enum('PENDING','SENT','FAILED','READ') NOT NULL DEFAULT 'PENDING',
  `material_id` int(11) DEFAULT NULL,
  `read_at` datetime(3) DEFAULT NULL,
  `sent_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `channel`, `status`, `material_id`, `read_at`, `sent_at`, `created_at`) VALUES
(53, 12, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'READ', 11, '2026-10-09 19:06:48.947', NULL, '2026-10-09 18:35:25.813'),
(54, 13, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:35:31.507'),
(55, 14, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:35:35.222'),
(56, 15, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:35:38.992'),
(57, 16, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:35:43.578'),
(58, 17, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:35:47.232'),
(59, 18, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:35:50.901'),
(60, 19, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:35:55.548'),
(61, 20, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:35:59.582'),
(62, 21, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:36:02.926'),
(63, 22, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:36:06.628'),
(64, 23, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:36:10.520'),
(65, 24, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:36:14.845'),
(66, 25, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:36:19.745'),
(67, 26, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:36:24.978'),
(68, 27, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:36:30.795'),
(69, 28, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:36:34.730'),
(70, 29, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:36:38.891'),
(71, 30, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:36:43.786'),
(72, 31, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:36:47.386'),
(73, 32, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:36:51.392'),
(74, 33, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:36:55.882'),
(75, 34, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:36:59.469'),
(76, 35, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:37:03.821'),
(77, 36, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:37:07.760'),
(78, 37, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:37:13.318'),
(79, 38, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:37:16.875'),
(80, 39, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:37:20.867'),
(81, 40, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:37:25.789'),
(82, 41, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:37:31.548'),
(83, 42, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:37:35.936'),
(84, 43, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:37:39.421'),
(85, 44, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:37:43.294'),
(86, 45, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:37:47.353'),
(87, 46, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:37:51.005'),
(88, 47, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:37:55.689'),
(89, 48, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:38:00.071'),
(90, 49, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:38:04.614'),
(91, 50, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:38:08.384'),
(92, 51, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:38:13.162'),
(93, 52, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:38:18.213'),
(94, 53, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:38:23.301'),
(95, 54, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:38:26.918'),
(96, 55, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:38:30.400'),
(97, 56, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:38:35.094'),
(98, 57, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:38:38.519'),
(99, 58, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:38:42.160'),
(100, 59, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:38:45.583'),
(101, 60, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:38:49.994'),
(102, 61, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:38:53.957'),
(103, 62, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:38:58.405'),
(104, 63, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:39:03.636'),
(105, 64, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:39:07.782'),
(106, 65, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:39:11.581'),
(107, 66, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:39:15.341'),
(108, 67, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:39:19.652'),
(109, 68, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:39:23.443'),
(110, 69, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:39:29.101'),
(111, 70, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:39:33.955'),
(112, 71, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 11, NULL, NULL, '2026-10-09 18:39:38.534'),
(113, 72, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : tableau_comparaison_LMS', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":11,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'READ', 11, '2026-10-09 18:44:39.535', NULL, '2026-10-09 18:39:44.535'),
(114, 12, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'READ', 12, '2026-10-13 18:31:29.532', NULL, '2026-10-10 07:42:10.905'),
(115, 13, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:43:18.491'),
(116, 14, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:43:38.395'),
(117, 15, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:43:47.400'),
(118, 16, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:43:57.286'),
(119, 17, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:44:30.312'),
(120, 18, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:44:52.616'),
(121, 19, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:45:17.288'),
(122, 20, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:45:26.092'),
(123, 21, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:45:32.473'),
(124, 22, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:45:36.557'),
(125, 23, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:45:40.616'),
(126, 24, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:45:45.557'),
(127, 25, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:45:58.221'),
(128, 26, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:46:02.203'),
(129, 27, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:46:06.110'),
(130, 28, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:46:11.144'),
(131, 29, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:46:15.718'),
(132, 30, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:46:19.449'),
(133, 31, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:46:23.302'),
(134, 32, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:46:32.699'),
(135, 33, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:46:41.364'),
(136, 34, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:47:10.895'),
(137, 35, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:47:30.596'),
(138, 36, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:47:40.761'),
(139, 37, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:47:58.365'),
(140, 38, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:48:04.968'),
(141, 39, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:48:11.228'),
(142, 40, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:48:15.422'),
(143, 41, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:48:19.786'),
(144, 42, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:48:25.122'),
(145, 43, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:48:29.124'),
(146, 44, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:48:32.921'),
(147, 45, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:48:38.048'),
(148, 46, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:48:41.875'),
(149, 47, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:48:45.624'),
(150, 48, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:48:50.731'),
(151, 49, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:48:54.816'),
(152, 50, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:48:58.548'),
(153, 51, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:49:03.489'),
(154, 52, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:49:07.695'),
(155, 53, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:49:11.684'),
(156, 54, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:49:15.676'),
(157, 55, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:49:19.720'),
(158, 56, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:49:23.702'),
(159, 57, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:49:27.682'),
(160, 58, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:49:33.268'),
(161, 59, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:49:38.380'),
(162, 60, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:49:43.798'),
(163, 61, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:49:51.007'),
(164, 62, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:49:57.220'),
(165, 63, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:50:01.605'),
(166, 64, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:50:08.797'),
(167, 65, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:50:14.525'),
(168, 66, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:50:18.332'),
(169, 67, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:50:30.430'),
(170, 68, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:50:37.437'),
(171, 69, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:50:42.161'),
(172, 70, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:50:46.237'),
(173, 71, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:50:51.398'),
(174, 72, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : 09_certificat_medical', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":12,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 12, NULL, NULL, '2026-10-10 07:51:06.897'),
(175, 12, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'READ', 13, '2026-10-13 21:03:19.786', NULL, '2026-10-13 20:41:07.067'),
(176, 13, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:41:11.590'),
(177, 14, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:41:15.582'),
(178, 15, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:41:18.762'),
(179, 16, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:41:22.449'),
(180, 17, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:41:26.700'),
(181, 18, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:41:31.274'),
(182, 19, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:41:35.324'),
(183, 20, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:41:38.517'),
(184, 21, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:41:42.823'),
(185, 22, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:41:46.811'),
(186, 23, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:41:50.702'),
(187, 24, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:41:54.492'),
(188, 25, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:41:58.554'),
(189, 26, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:42:02.377'),
(190, 27, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:42:05.961'),
(191, 28, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:42:09.856'),
(192, 29, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:42:18.114'),
(193, 30, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:42:21.530'),
(194, 31, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:42:25.212'),
(195, 32, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:42:28.897'),
(196, 33, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:42:32.658'),
(197, 34, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:42:37.307'),
(198, 35, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:42:41.848'),
(199, 36, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:42:45.709'),
(200, 37, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:42:50.143'),
(201, 38, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:42:53.713'),
(202, 39, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:42:58.951'),
(203, 40, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:43:02.588'),
(204, 41, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:43:06.945'),
(205, 42, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:43:10.623'),
(206, 43, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:43:14.292'),
(207, 44, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:43:17.808'),
(208, 45, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:43:21.638'),
(209, 46, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:43:25.870'),
(210, 47, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:43:29.532'),
(211, 48, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:43:33.086'),
(212, 49, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:43:36.527'),
(213, 50, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:43:39.963'),
(214, 51, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:43:43.297'),
(215, 52, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:43:47.231'),
(216, 53, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:43:52.151'),
(217, 54, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:43:56.211'),
(218, 55, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:43:59.933'),
(219, 56, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:44:03.861'),
(220, 57, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:44:07.961'),
(221, 58, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:44:11.891'),
(222, 59, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:44:17.339'),
(223, 60, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:44:21.595'),
(224, 61, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:44:25.272'),
(225, 62, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:44:28.749'),
(226, 63, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:44:32.439'),
(227, 64, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:44:36.179'),
(228, 65, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:44:39.909'),
(229, 66, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:44:45.379'),
(230, 67, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:44:48.855'),
(231, 68, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:44:52.566'),
(232, 69, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:44:57.275'),
(233, 70, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:45:00.947'),
(234, 71, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:45:04.608'),
(235, 72, 'COURSE_ANNOUNCEMENT', '📚 Nouveau support : Lecon_POO_PHP', 'Un nouveau support a été ajouté au cours \"programmation sous php\"', '{\"materialId\":13,\"courseId\":11,\"courseCode\":\"PHP\"}', 'IN_APP', 'PENDING', 13, NULL, NULL, '2026-10-13 20:45:07.895');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `channel`, `status`, `material_id`, `read_at`, `sent_at`, `created_at`) VALUES
(236, 1, 'SYSTEM', '💰 Nouveau paiement Mobile Money', 'L\'étudiant nivo ramahatana a payé 500000 MGA via MVOLA.', '{\"paymentId\":3,\"invoiceId\":19,\"amount\":500000,\"operator\":\"MVOLA\",\"phoneNumber\":\"0349162826\",\"receiptRef\":\"REC-2026-0001\",\"pdfUrl\":\"/uploads/receipts/REC-2026-0001.pdf\"}', 'IN_APP', 'PENDING', NULL, NULL, NULL, '2026-10-17 06:40:27.875'),
(237, 1, 'SYSTEM', '💰 Nouveau paiement Mobile Money', 'L\'étudiant Masoandro Razanakoto a payé 166666 MGA via MVOLA.', '{\"paymentId\":4,\"invoiceId\":560,\"amount\":166666,\"operator\":\"MVOLA\",\"phoneNumber\":\"0349162826\",\"receiptRef\":\"REC-2026-0002\",\"pdfUrl\":\"/uploads/receipts/REC-2026-0002.pdf\"}', 'IN_APP', 'READ', NULL, '2026-11-03 16:51:09.540', NULL, '2026-10-17 06:51:29.234'),
(238, 1, 'SYSTEM', '💰 Nouveau paiement Mobile Money', 'L\'étudiant nivo ramahatana a payé 150000 MGA via MVOLA.', '{\"paymentId\":5,\"invoiceId\":28,\"amount\":150000,\"operator\":\"MVOLA\",\"phoneNumber\":\"0349162826\",\"receiptRef\":\"REC-2026-0003\",\"pdfUrl\":\"/uploads/receipts/REC-2026-0003.pdf\"}', 'IN_APP', 'PENDING', NULL, NULL, NULL, '2026-11-06 05:33:56.532');

-- --------------------------------------------------------

--
-- Structure de la table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `reference` varchar(191) NOT NULL,
  `invoice_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` varchar(191) NOT NULL DEFAULT 'MGA',
  `method` enum('CASH','BANK_TRANSFER','CHECK','MOBILE_MONEY_MVOLA','MOBILE_MONEY_ORANGE','MOBILE_MONEY_AIRTEL','STRIPE_CARD','OTHER') NOT NULL,
  `status` enum('PENDING','COMPLETED','FAILED','REFUNDED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `external_ref` varchar(191) DEFAULT NULL,
  `transaction_id` varchar(191) DEFAULT NULL,
  `paid_at` datetime(3) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `notes` text DEFAULT NULL,
  `created_by_id` int(11) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `payments`
--

INSERT INTO `payments` (`id`, `reference`, `invoice_id`, `student_id`, `amount`, `currency`, `method`, `status`, `external_ref`, `transaction_id`, `paid_at`, `metadata`, `notes`, `created_by_id`, `created_at`, `updated_at`) VALUES
(3, 'PAY-2026-0001', 19, 12, 500000.00, 'MGA', 'MOBILE_MONEY_MVOLA', 'COMPLETED', 'SIM-MVOLA-1792219227158-8094', 'SIM-MVOLA-1792219227158-8094', '2026-10-17 06:40:27.158', '{\"simulationMode\":true,\"operator\":\"MVOLA\",\"phoneNumber\":\"0349162826\",\"simulatedRef\":\"SIM-MVOLA-1792219227158-8094\",\"simulatedAt\":\"2026-10-17T06:40:27.311Z\",\"invoiceReference\":\"INV-TEST-001\"}', 'Paiement Mobile Money MVOLA - 0349162826', 12, '2026-10-17 06:40:27.184', '2026-10-17 06:40:27.316'),
(4, 'PAY-2026-0002', 560, 72, 166666.00, 'MGA', 'MOBILE_MONEY_MVOLA', 'COMPLETED', 'SIM-MVOLA-1792219888763-9380', 'SIM-MVOLA-1792219888763-9380', '2026-10-17 06:51:28.763', '{\"simulationMode\":true,\"operator\":\"MVOLA\",\"phoneNumber\":\"0349162826\",\"simulatedRef\":\"SIM-MVOLA-1792219888763-9380\",\"simulatedAt\":\"2026-10-17T06:51:29.115Z\",\"invoiceReference\":\"FAC-2026-0541\"}', 'Paiement Mobile Money MVOLA - 0349162826', 72, '2026-10-17 06:51:28.798', '2026-10-17 06:51:29.117'),
(5, 'PAY-2026-0003', 28, 12, 150000.00, 'MGA', 'MOBILE_MONEY_MVOLA', 'COMPLETED', 'SIM-MVOLA-1793943235878-5463', 'SIM-MVOLA-1793943235878-5463', '2026-11-06 05:33:55.879', '{\"simulationMode\":true,\"operator\":\"MVOLA\",\"phoneNumber\":\"0349162826\",\"simulatedRef\":\"SIM-MVOLA-1793943235878-5463\",\"simulatedAt\":\"2026-11-06T05:33:56.028Z\",\"invoiceReference\":\"FAC-2026-0009\"}', 'Paiement Mobile Money MVOLA - 0349162826', 12, '2026-11-06 05:33:55.912', '2026-11-06 05:33:56.033');

-- --------------------------------------------------------

--
-- Structure de la table `payment_reminders`
--

CREATE TABLE `payment_reminders` (
  `id` int(11) NOT NULL,
  `invoice_id` int(11) NOT NULL,
  `type` enum('EMAIL','SMS','IN_APP') NOT NULL,
  `status` enum('PENDING','SENT','FAILED') NOT NULL DEFAULT 'PENDING',
  `message` text NOT NULL,
  `sent_to` varchar(191) DEFAULT NULL,
  `sent_at` datetime(3) DEFAULT NULL,
  `error` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `payment_schedules`
--

CREATE TABLE `payment_schedules` (
  `id` int(11) NOT NULL,
  `academic_year` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `installments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`installments`)),
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `platform_settings`
--

CREATE TABLE `platform_settings` (
  `id` int(11) NOT NULL,
  `platform_name` varchar(191) NOT NULL,
  `platform_short_name` varchar(191) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `logo_url` varchar(191) DEFAULT NULL,
  `favicon_url` varchar(191) DEFAULT NULL,
  `primary_color` varchar(191) NOT NULL DEFAULT '#3B82F6',
  `secondary_color` varchar(191) NOT NULL DEFAULT '#1E40AF',
  `default_language` varchar(191) NOT NULL DEFAULT 'fr',
  `timezone` varchar(191) NOT NULL DEFAULT 'Africa/Antananarivo',
  `currency` varchar(191) NOT NULL DEFAULT 'MGA',
  `currency_symbol` varchar(191) NOT NULL DEFAULT 'Ar',
  `academic_year` varchar(191) DEFAULT NULL,
  `grade_scale_max` decimal(4,2) NOT NULL DEFAULT 20.00,
  `grade_scale_min` decimal(4,2) NOT NULL DEFAULT 0.00,
  `passing_grade` decimal(4,2) NOT NULL DEFAULT 10.00,
  `contact_email` varchar(191) DEFAULT NULL,
  `contact_phone` varchar(191) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `custom_labels` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`custom_labels`)),
  `hierarchy_model` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`hierarchy_model`)),
  `institution_type` enum('UNIVERSITY','HIGH_SCHOOL','MIDDLE_SCHOOL','CUSTOM') NOT NULL DEFAULT 'UNIVERSITY',
  `onboarding_done` tinyint(1) NOT NULL DEFAULT 0,
  `academic_months_count` int(11) NOT NULL DEFAULT 9,
  `academic_start_month` int(11) NOT NULL DEFAULT 10
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `platform_settings`
--

INSERT INTO `platform_settings` (`id`, `platform_name`, `platform_short_name`, `description`, `logo_url`, `favicon_url`, `primary_color`, `secondary_color`, `default_language`, `timezone`, `currency`, `currency_symbol`, `academic_year`, `grade_scale_max`, `grade_scale_min`, `passing_grade`, `contact_email`, `contact_phone`, `address`, `created_at`, `updated_at`, `custom_labels`, `hierarchy_model`, `institution_type`, `onboarding_done`, `academic_months_count`, `academic_start_month`) VALUES
(1, 'MASTERCLASS', 'ROOT', 'ON ETUDIE ENSEMBLE', NULL, NULL, '#3B82F6', '#1E40AF', 'fr', 'Africa/Antananarivo', 'MGA', 'Ar', '2025-2026', 20.00, 0.00, 10.00, 'anjara.raholison2503@gmail.com', '0349162826', 'Ambatomainty', '2026-09-17 19:03:18.684', '2026-10-09 18:27:46.416', 'null', '{\"name\":\"Personnalisé\",\"description\":\"Structure personnalisée : Établissement → Département → Programme → Niveau → Classe\",\"levels\":[{\"type\":\"ESTABLISHMENT\",\"label\":\"Établissement\",\"pluralLabel\":\"I-learning\",\"icon\":\"🏛️\",\"enabled\":true},{\"type\":\"DEPARTMENT\",\"label\":\"Département\",\"pluralLabel\":\"Départements\",\"icon\":\"📚\",\"enabled\":true},{\"type\":\"PROGRAM\",\"label\":\"Programme\",\"pluralLabel\":\"Programmes\",\"icon\":\"🎓\",\"enabled\":true},{\"type\":\"LEVEL\",\"label\":\"Niveau\",\"pluralLabel\":\"Niveaux\",\"icon\":\"📊\",\"enabled\":true},{\"type\":\"CLASS\",\"label\":\"Classe\",\"pluralLabel\":\"Classes\",\"icon\":\"👥\",\"enabled\":true}],\"allowedChildren\":{\"ESTABLISHMENT\":[\"DEPARTMENT\"],\"DEPARTMENT\":[\"PROGRAM\"],\"PROGRAM\":[\"LEVEL\"],\"LEVEL\":[\"CLASS\"],\"CLASS\":[]}}', 'CUSTOM', 1, 9, 10);

-- --------------------------------------------------------

--
-- Structure de la table `quizzes`
--

CREATE TABLE `quizzes` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `duration` int(11) NOT NULL DEFAULT 30,
  `max_attempts` int(11) NOT NULL DEFAULT 1,
  `passing_score` int(11) NOT NULL DEFAULT 10,
  `shuffle_questions` tinyint(1) NOT NULL DEFAULT 1,
  `shuffle_answers` tinyint(1) NOT NULL DEFAULT 1,
  `detect_tab_switch` tinyint(1) NOT NULL DEFAULT 1,
  `max_tab_switches` int(11) NOT NULL DEFAULT 3,
  `source_file_url` varchar(191) DEFAULT NULL,
  `source_file_name` varchar(191) DEFAULT NULL,
  `ai_generated` tinyint(1) NOT NULL DEFAULT 0,
  `ai_generation_status` varchar(191) DEFAULT 'PENDING',
  `status` enum('DRAFT','PUBLISHED','CLOSED','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  `created_by_id` int(11) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `quizzes`
--

INSERT INTO `quizzes` (`id`, `course_id`, `title`, `description`, `duration`, `max_attempts`, `passing_score`, `shuffle_questions`, `shuffle_answers`, `detect_tab_switch`, `max_tab_switches`, `source_file_url`, `source_file_name`, `ai_generated`, `ai_generation_status`, `status`, `created_by_id`, `created_at`, `updated_at`) VALUES
(8, 11, 'php', 'Quiz généré automatiquement par IA', 30, 1, 10, 1, 1, 1, 3, '/uploads/assignments/2026-10/cours_introduction_programmation_php-1791916229621-904746243.pdf', 'cours_introduction_programmation_php.pdf', 1, 'COMPLETED', 'PUBLISHED', 11, '2026-10-13 18:30:30.131', '2026-10-13 20:38:28.620'),
(25, 11, 'cours_introduction_programmation_php', 'Quiz généré automatiquement par IA', 30, 1, 10, 1, 1, 1, 3, '/uploads/assignments/2026-10/cours_introduction_programmation_php-1791923955264-672109734.pdf', 'cours_introduction_programmation_php.pdf', 1, 'COMPLETED', 'PUBLISHED', 11, '2026-10-13 20:39:15.316', '2026-10-13 20:40:16.268'),
(30, 11, 'Cours PHP - Test', 'Quiz généré automatiquement par IA', 30, 1, 10, 1, 1, 1, 3, '/uploads/assignments/2026-10/cours-php.txt', 'cours-php.txt', 1, 'COMPLETED', 'DRAFT', 1, '2026-10-14 10:25:56.859', '2026-10-14 10:25:56.981'),
(32, 11, 'Cours PHP - TXT', 'Quiz généré automatiquement par IA', 30, 1, 10, 1, 1, 1, 3, '/uploads/assignments/2026-10/cours-php.txt', 'cours-php.txt', 1, 'COMPLETED', 'DRAFT', 1, '2026-10-14 10:42:06.468', '2026-10-14 10:42:06.566'),
(37, 11, 'POO PHP - TXT', 'Quiz généré automatiquement par IA', 30, 1, 10, 1, 1, 1, 3, '/uploads/assignments/2026-10/poo-php.txt', 'poo-php.txt', 1, 'COMPLETED', 'DRAFT', 1, '2026-10-15 18:42:28.152', '2026-10-15 18:42:28.312'),
(38, 11, 'poo-php', 'Quiz généré automatiquement par IA', 30, 1, 10, 1, 1, 1, 3, '/uploads/assignments/2026-10/poo-php-1792089872106-344414108.txt', 'poo-php.txt', 1, 'COMPLETED', 'DRAFT', 11, '2026-10-15 18:44:32.196', '2026-10-15 18:44:32.452'),
(39, 11, 'cours-javascript', 'Quiz généré automatiquement par IA', 30, 1, 10, 1, 1, 1, 3, '/uploads/assignments/2026-10/cours-javascript-1792089902146-530971858.txt', 'cours-javascript.txt', 1, 'COMPLETED', 'DRAFT', 11, '2026-10-15 18:45:02.202', '2026-10-15 18:45:02.461'),
(40, 11, 'Lecon_POO_PHP', 'Quiz généré automatiquement par IA', 30, 1, 10, 1, 1, 1, 3, '/uploads/assignments/2026-10/Lecon_POO_PHP-1792089916693-18811686.pdf', 'Lecon_POO_PHP.pdf', 1, 'COMPLETED', 'PUBLISHED', 11, '2026-10-15 18:45:16.732', '2026-10-15 18:47:11.820');

-- --------------------------------------------------------

--
-- Structure de la table `quiz_answers`
--

CREATE TABLE `quiz_answers` (
  `id` int(11) NOT NULL,
  `attempt_id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `answer` text DEFAULT NULL,
  `is_correct` tinyint(1) DEFAULT NULL,
  `points_earned` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `quiz_answers`
--

INSERT INTO `quiz_answers` (`id`, `attempt_id`, `question_id`, `answer`, `is_correct`, `points_earned`) VALUES
(1, 2, 1, NULL, 0, 0.00),
(2, 2, 2, NULL, 0, 0.00),
(3, 2, 3, NULL, 0, 0.00),
(4, 2, 4, 'Affirmation A (correcte)', 1, 1.00),
(5, 2, 5, NULL, 0, 0.00),
(6, 2, 6, NULL, 0, 0.00),
(7, 2, 7, NULL, 0, 0.00),
(8, 2, 8, 'Vrai', 0, 0.00),
(9, 2, 9, NULL, 0, 0.00),
(10, 2, 10, NULL, 0, 0.00),
(11, 4, 16, NULL, 0, 0.00),
(12, 4, 17, NULL, 0, 0.00),
(13, 4, 18, NULL, 0, 0.00),
(14, 4, 19, NULL, 0, 0.00),
(15, 4, 20, 'Faux', 0, 0.00),
(16, 4, 21, NULL, 0, 0.00),
(17, 4, 22, NULL, 0, 0.00),
(18, 4, 23, 'Vrai', 0, 0.00),
(19, 4, 24, NULL, 0, 0.00),
(20, 4, 25, NULL, 0, 0.00);

-- --------------------------------------------------------

--
-- Structure de la table `quiz_attempts`
--

CREATE TABLE `quiz_attempts` (
  `id` int(11) NOT NULL,
  `quiz_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `tab_switch_count` int(11) NOT NULL DEFAULT 0,
  `warnings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`warnings`)),
  `is_flagged` tinyint(1) NOT NULL DEFAULT 0,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `submitted_at` datetime(3) DEFAULT NULL,
  `score` decimal(5,2) DEFAULT NULL,
  `status` enum('IN_PROGRESS','SUBMITTED','GRADED','TIMEOUT','ABANDONED') NOT NULL DEFAULT 'IN_PROGRESS'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `quiz_attempts`
--

INSERT INTO `quiz_attempts` (`id`, `quiz_id`, `student_id`, `tab_switch_count`, `warnings`, `is_flagged`, `started_at`, `submitted_at`, `score`, `status`) VALUES
(1, 8, 12, 0, NULL, 0, '2026-10-13 18:31:57.104', NULL, NULL, 'IN_PROGRESS'),
(2, 8, 12, 0, NULL, 0, '2026-10-13 18:31:57.099', '2026-10-13 18:34:03.424', 1.54, 'SUBMITTED'),
(3, 25, 12, 0, NULL, 0, '2026-10-13 21:04:06.650', NULL, NULL, 'IN_PROGRESS'),
(4, 25, 12, 0, NULL, 0, '2026-10-13 21:04:06.651', '2026-10-13 21:04:42.640', 0.00, 'SUBMITTED'),
(5, 40, 12, 3, '[{\"type\":\"TAB_SWITCH\",\"timestamp\":\"2026-10-15T18:48:11.046Z\",\"count\":1},{\"type\":\"TAB_SWITCH\",\"timestamp\":\"2026-10-15T18:48:33.834Z\",\"count\":2},{\"type\":\"TAB_SWITCH\",\"timestamp\":\"2026-10-15T18:48:46.029Z\",\"count\":3}]', 1, '2026-10-15 18:47:47.170', '2026-10-15 18:48:46.151', NULL, 'SUBMITTED'),
(6, 40, 12, 0, NULL, 0, '2026-10-15 18:47:47.168', NULL, NULL, 'IN_PROGRESS');

-- --------------------------------------------------------

--
-- Structure de la table `quiz_questions`
--

CREATE TABLE `quiz_questions` (
  `id` int(11) NOT NULL,
  `quiz_id` int(11) NOT NULL,
  `question` text NOT NULL,
  `type` enum('MULTIPLE_CHOICE','TRUE_FALSE','SHORT_ANSWER','FILL_IN_BLANK') NOT NULL DEFAULT 'MULTIPLE_CHOICE',
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options`)),
  `correct_answer` text DEFAULT NULL,
  `explanation` text DEFAULT NULL,
  `points` int(11) NOT NULL DEFAULT 1,
  `difficulty` varchar(191) DEFAULT 'MEDIUM',
  `order_index` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `quiz_questions`
--

INSERT INTO `quiz_questions` (`id`, `quiz_id`, `question`, `type`, `options`, `correct_answer`, `explanation`, `points`, `difficulty`, `order_index`) VALUES
(1, 8, 'Concernant \"Cours d’introduction à PHP2\nPlan du cours\n• 1...\", quelle affirmation est correcte ?', 'MULTIPLE_CHOICE', '[{\"text\":\"Affirmation A (correcte)\",\"isCorrect\":true},{\"text\":\"Affirmation B\",\"isCorrect\":false},{\"text\":\"Affirmation C\",\"isCorrect\":false},{\"text\":\"Affirmation D\",\"isCorrect\":false}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 0),
(2, 8, 'Vrai ou Faux : Comprendre PHP et préparer son environnement\n• 2', 'TRUE_FALSE', '[{\"text\":\"Vrai\",\"isCorrect\":false},{\"text\":\"Faux\",\"isCorrect\":true}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 1),
(3, 8, 'Expliquez brièvement : Écrire du PHP : variables, types et affichage\n• 3', 'SHORT_ANSWER', 'null', 'Réponse attendue générée en simulation.', 'Réponse générée en mode simulation.', 2, 'MEDIUM', 2),
(4, 8, 'Concernant \"Conditions, boucles et tableaux\n• 4...\", quelle affirmation est correcte ?', 'MULTIPLE_CHOICE', '[{\"text\":\"Affirmation A (correcte)\",\"isCorrect\":true},{\"text\":\"Affirmation B\",\"isCorrect\":false},{\"text\":\"Affirmation C\",\"isCorrect\":false},{\"text\":\"Affirmation D\",\"isCorrect\":false}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 3),
(5, 8, 'Vrai ou Faux : Fonctions et organisation du code\n• 5', 'TRUE_FALSE', '[{\"text\":\"Vrai\",\"isCorrect\":true},{\"text\":\"Faux\",\"isCorrect\":false}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 4),
(6, 8, 'Expliquez brièvement : Formulaires HTTP et validation\n• 6', 'SHORT_ANSWER', 'null', 'Réponse attendue générée en simulation.', 'Réponse générée en mode simulation.', 2, 'MEDIUM', 5),
(7, 8, 'Concernant \"Sécurité, débogage et bonnes pratiques\n• 8...\", quelle affirmation est correcte ?', 'MULTIPLE_CHOICE', '[{\"text\":\"Affirmation A (correcte)\",\"isCorrect\":true},{\"text\":\"Affirmation B\",\"isCorrect\":false},{\"text\":\"Affirmation C\",\"isCorrect\":false},{\"text\":\"Affirmation D\",\"isCorrect\":false}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 6),
(8, 8, 'Vrai ou Faux : PHP en bref\nPHP est un langage exécuté côté serveur', 'TRUE_FALSE', '[{\"text\":\"Vrai\",\"isCorrect\":false},{\"text\":\"Faux\",\"isCorrect\":true}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 7),
(9, 8, 'Expliquez brièvement : Le serveur interprète le code PHP puis renvoie généralement au\nnavigateur du HTML', 'SHORT_ANSWER', 'null', 'Réponse attendue générée en simulation.', 'Réponse générée en mode simulation.', 2, 'MEDIUM', 8),
(10, 8, 'Concernant \"L’utilisateur ne reçoit donc pas le code PHP source, mais la réponse produite...\", quelle affirmation est correcte ?', 'MULTIPLE_CHOICE', '[{\"text\":\"Affirmation A (correcte)\",\"isCorrect\":true},{\"text\":\"Affirmation B\",\"isCorrect\":false},{\"text\":\"Affirmation C\",\"isCorrect\":false},{\"text\":\"Affirmation D\",\"isCorrect\":false}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 9),
(16, 25, 'Concernant \"Cours d’introduction à PHP2\nPlan du cours\n• 1...\", quelle affirmation est correcte ?', 'MULTIPLE_CHOICE', '[{\"text\":\"Affirmation A (correcte)\",\"isCorrect\":true},{\"text\":\"Affirmation B\",\"isCorrect\":false},{\"text\":\"Affirmation C\",\"isCorrect\":false},{\"text\":\"Affirmation D\",\"isCorrect\":false}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 0),
(17, 25, 'Vrai ou Faux : Comprendre PHP et préparer son environnement\n• 2', 'TRUE_FALSE', '[{\"text\":\"Vrai\",\"isCorrect\":false},{\"text\":\"Faux\",\"isCorrect\":true}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 1),
(18, 25, 'Expliquez brièvement : Écrire du PHP : variables, types et affichage\n• 3', 'SHORT_ANSWER', 'null', 'Réponse attendue générée en simulation.', 'Réponse générée en mode simulation.', 2, 'MEDIUM', 2),
(19, 25, 'Concernant \"Conditions, boucles et tableaux\n• 4...\", quelle affirmation est correcte ?', 'MULTIPLE_CHOICE', '[{\"text\":\"Affirmation A (correcte)\",\"isCorrect\":true},{\"text\":\"Affirmation B\",\"isCorrect\":false},{\"text\":\"Affirmation C\",\"isCorrect\":false},{\"text\":\"Affirmation D\",\"isCorrect\":false}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 3),
(20, 25, 'Vrai ou Faux : Fonctions et organisation du code\n• 5', 'TRUE_FALSE', '[{\"text\":\"Vrai\",\"isCorrect\":true},{\"text\":\"Faux\",\"isCorrect\":false}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 4),
(21, 25, 'Expliquez brièvement : Formulaires HTTP et validation\n• 6', 'SHORT_ANSWER', 'null', 'Réponse attendue générée en simulation.', 'Réponse générée en mode simulation.', 2, 'MEDIUM', 5),
(22, 25, 'Concernant \"Sécurité, débogage et bonnes pratiques\n• 8...\", quelle affirmation est correcte ?', 'MULTIPLE_CHOICE', '[{\"text\":\"Affirmation A (correcte)\",\"isCorrect\":true},{\"text\":\"Affirmation B\",\"isCorrect\":false},{\"text\":\"Affirmation C\",\"isCorrect\":false},{\"text\":\"Affirmation D\",\"isCorrect\":false}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 6),
(23, 25, 'Vrai ou Faux : PHP en bref\nPHP est un langage exécuté côté serveur', 'TRUE_FALSE', '[{\"text\":\"Vrai\",\"isCorrect\":false},{\"text\":\"Faux\",\"isCorrect\":true}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 7),
(24, 25, 'Expliquez brièvement : Le serveur interprète le code PHP puis renvoie généralement au\nnavigateur du HTML', 'SHORT_ANSWER', 'null', 'Réponse attendue générée en simulation.', 'Réponse générée en mode simulation.', 2, 'MEDIUM', 8),
(25, 25, 'Concernant \"L’utilisateur ne reçoit donc pas le code PHP source, mais la réponse produite...\", quelle affirmation est correcte ?', 'MULTIPLE_CHOICE', '[{\"text\":\"Affirmation A (correcte)\",\"isCorrect\":true},{\"text\":\"Affirmation B\",\"isCorrect\":false},{\"text\":\"Affirmation C\",\"isCorrect\":false},{\"text\":\"Affirmation D\",\"isCorrect\":false}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 9),
(26, 30, 'Concernant \"Cours : Introduction a la programmation PHP\r\n\r\nCHAPITRE 1 : LES VARIABLES\r\nLes v...\", quelle affirmation est correcte ?', 'MULTIPLE_CHOICE', '[{\"text\":\"Affirmation A (correcte)\",\"isCorrect\":true},{\"text\":\"Affirmation B\",\"isCorrect\":false},{\"text\":\"Affirmation C\",\"isCorrect\":false},{\"text\":\"Affirmation D\",\"isCorrect\":false}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 0),
(27, 30, 'Vrai ou Faux : En PHP, une variable commence par le symbole dollar', 'TRUE_FALSE', '[{\"text\":\"Vrai\",\"isCorrect\":false},{\"text\":\"Faux\",\"isCorrect\":true}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 1),
(28, 30, 'Expliquez brièvement : On peut affecter une valeur avec le signe egal', 'SHORT_ANSWER', 'null', 'Réponse attendue générée en simulation.', 'Réponse générée en mode simulation.', 2, 'MEDIUM', 2),
(29, 30, 'Concernant \"CHAPITRE 2 : LES FONCTIONS\r\nLes fonctions permettent de regrouper du code reutil...\", quelle affirmation est correcte ?', 'MULTIPLE_CHOICE', '[{\"text\":\"Affirmation A (correcte)\",\"isCorrect\":true},{\"text\":\"Affirmation B\",\"isCorrect\":false},{\"text\":\"Affirmation C\",\"isCorrect\":false},{\"text\":\"Affirmation D\",\"isCorrect\":false}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 3),
(30, 30, 'Vrai ou Faux : Une fonction peut prendre des parametres et retourner une valeur', 'TRUE_FALSE', '[{\"text\":\"Vrai\",\"isCorrect\":true},{\"text\":\"Faux\",\"isCorrect\":false}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 4),
(31, 32, 'Concernant \"En PHP, une variable commence par un dollar...\", quelle affirmation est correcte ?', 'MULTIPLE_CHOICE', '[{\"text\":\"Affirmation A (correcte)\",\"isCorrect\":true},{\"text\":\"Affirmation B\",\"isCorrect\":false},{\"text\":\"Affirmation C\",\"isCorrect\":false},{\"text\":\"Affirmation D\",\"isCorrect\":false}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 0),
(32, 32, 'Vrai ou Faux : Les operateurs arithmetiques incluent plus, moins, fois, divise', 'TRUE_FALSE', '[{\"text\":\"Vrai\",\"isCorrect\":false},{\"text\":\"Faux\",\"isCorrect\":true}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 1),
(33, 32, 'Expliquez brièvement : Les operateurs de comparaison incluent egal, different, superieur, inferieur', 'SHORT_ANSWER', 'null', 'Réponse attendue générée en simulation.', 'Réponse générée en mode simulation.', 2, 'MEDIUM', 2),
(34, 32, 'Concernant \"Les structures conditionnelles utilisent if, else, elseif et switch...\", quelle affirmation est correcte ?', 'MULTIPLE_CHOICE', '[{\"text\":\"Affirmation A (correcte)\",\"isCorrect\":true},{\"text\":\"Affirmation B\",\"isCorrect\":false},{\"text\":\"Affirmation C\",\"isCorrect\":false},{\"text\":\"Affirmation D\",\"isCorrect\":false}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 3),
(35, 32, 'Vrai ou Faux : Les boucles incluent for, while, do-while et foreach', 'TRUE_FALSE', '[{\"text\":\"Vrai\",\"isCorrect\":true},{\"text\":\"Faux\",\"isCorrect\":false}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 4),
(36, 37, 'Concernant \"Cours POO PHP : la programmation orientee objet repose sur 4 principes fondament...\", quelle affirmation est correcte ?', 'MULTIPLE_CHOICE', '[{\"text\":\"Affirmation A (correcte)\",\"isCorrect\":true},{\"text\":\"Affirmation B\",\"isCorrect\":false},{\"text\":\"Affirmation C\",\"isCorrect\":false},{\"text\":\"Affirmation D\",\"isCorrect\":false}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 0),
(37, 37, 'Vrai ou Faux : L encapsulation protege les donnees internes de la classe', 'TRUE_FALSE', '[{\"text\":\"Vrai\",\"isCorrect\":false},{\"text\":\"Faux\",\"isCorrect\":true}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 1),
(38, 37, 'Expliquez brièvement : L heritage permet a une classe de reutiliser le code d une classe parente', 'SHORT_ANSWER', 'null', 'Réponse attendue générée en simulation.', 'Réponse générée en mode simulation.', 2, 'MEDIUM', 2),
(39, 37, 'Concernant \"Le polymorphisme permet a des objets de classes differentes de repondre au meme ...\", quelle affirmation est correcte ?', 'MULTIPLE_CHOICE', '[{\"text\":\"Affirmation A (correcte)\",\"isCorrect\":true},{\"text\":\"Affirmation B\",\"isCorrect\":false},{\"text\":\"Affirmation C\",\"isCorrect\":false},{\"text\":\"Affirmation D\",\"isCorrect\":false}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 3),
(40, 37, 'Vrai ou Faux : L abstraction cache les details d implementation derriere une interface', 'TRUE_FALSE', '[{\"text\":\"Vrai\",\"isCorrect\":true},{\"text\":\"Faux\",\"isCorrect\":false}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 4),
(41, 38, 'Concernant \"Cours POO PHP : la programmation orientee objet repose sur 4 principes fondament...\", quelle affirmation est correcte ?', 'MULTIPLE_CHOICE', '[{\"text\":\"Affirmation A (correcte)\",\"isCorrect\":true},{\"text\":\"Affirmation B\",\"isCorrect\":false},{\"text\":\"Affirmation C\",\"isCorrect\":false},{\"text\":\"Affirmation D\",\"isCorrect\":false}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 0),
(42, 38, 'Vrai ou Faux : L encapsulation protege les donnees internes de la classe', 'TRUE_FALSE', '[{\"text\":\"Vrai\",\"isCorrect\":false},{\"text\":\"Faux\",\"isCorrect\":true}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 1),
(43, 38, 'Expliquez brièvement : L heritage permet a une classe de reutiliser le code d une classe parente', 'SHORT_ANSWER', 'null', 'Réponse attendue générée en simulation.', 'Réponse générée en mode simulation.', 2, 'MEDIUM', 2),
(44, 38, 'Concernant \"Le polymorphisme permet a des objets de classes differentes de repondre au meme ...\", quelle affirmation est correcte ?', 'MULTIPLE_CHOICE', '[{\"text\":\"Affirmation A (correcte)\",\"isCorrect\":true},{\"text\":\"Affirmation B\",\"isCorrect\":false},{\"text\":\"Affirmation C\",\"isCorrect\":false},{\"text\":\"Affirmation D\",\"isCorrect\":false}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 3),
(45, 38, 'Vrai ou Faux : L abstraction cache les details d implementation derriere une interface', 'TRUE_FALSE', '[{\"text\":\"Vrai\",\"isCorrect\":true},{\"text\":\"Faux\",\"isCorrect\":false}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 4),
(46, 38, 'Expliquez brièvement : Une classe est un modele qui definit des proprietes et des methodes', 'SHORT_ANSWER', 'null', 'Réponse attendue générée en simulation.', 'Réponse générée en mode simulation.', 2, 'MEDIUM', 5),
(47, 38, 'Concernant \"Un objet est une instance concrete d une classe...\", quelle affirmation est correcte ?', 'MULTIPLE_CHOICE', '[{\"text\":\"Affirmation A (correcte)\",\"isCorrect\":true},{\"text\":\"Affirmation B\",\"isCorrect\":false},{\"text\":\"Affirmation C\",\"isCorrect\":false},{\"text\":\"Affirmation D\",\"isCorrect\":false}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 6),
(48, 38, 'Vrai ou Faux : Le constructeur est appele lors de la creation d un objet', 'TRUE_FALSE', '[{\"text\":\"Vrai\",\"isCorrect\":false},{\"text\":\"Faux\",\"isCorrect\":true}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 7),
(49, 38, 'Expliquez brièvement : Le destructeur est appele lors de la destruction d un objet', 'SHORT_ANSWER', 'null', 'Réponse attendue générée en simulation.', 'Réponse générée en mode simulation.', 2, 'MEDIUM', 8),
(50, 38, 'Concernant \"Les methodes magiques commencent par deux underscores...\", quelle affirmation est correcte ?', 'MULTIPLE_CHOICE', '[{\"text\":\"Affirmation A (correcte)\",\"isCorrect\":true},{\"text\":\"Affirmation B\",\"isCorrect\":false},{\"text\":\"Affirmation C\",\"isCorrect\":false},{\"text\":\"Affirmation D\",\"isCorrect\":false}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 9),
(51, 39, 'Concernant \"Cours : Introduction a JavaScript\r\n\r\nLES VARIABLES\r\nEn JavaScript, on peut decla...\", quelle affirmation est correcte ?', 'MULTIPLE_CHOICE', '[{\"text\":\"Affirmation A (correcte)\",\"isCorrect\":true},{\"text\":\"Affirmation B\",\"isCorrect\":false},{\"text\":\"Affirmation C\",\"isCorrect\":false},{\"text\":\"Affirmation D\",\"isCorrect\":false}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 0),
(52, 39, 'Vrai ou Faux : let permet de reassigner la variable plus tard', 'TRUE_FALSE', '[{\"text\":\"Vrai\",\"isCorrect\":false},{\"text\":\"Faux\",\"isCorrect\":true}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 1),
(53, 39, 'Expliquez brièvement : const cree une constante non reassignable', 'SHORT_ANSWER', 'null', 'Réponse attendue générée en simulation.', 'Réponse générée en mode simulation.', 2, 'MEDIUM', 2),
(54, 39, 'Concernant \"LES FONCTIONS\r\nLes fonctions flechees offrent une syntaxe plus concise...\", quelle affirmation est correcte ?', 'MULTIPLE_CHOICE', '[{\"text\":\"Affirmation A (correcte)\",\"isCorrect\":true},{\"text\":\"Affirmation B\",\"isCorrect\":false},{\"text\":\"Affirmation C\",\"isCorrect\":false},{\"text\":\"Affirmation D\",\"isCorrect\":false}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 3),
(55, 39, 'Vrai ou Faux : Une fonction peut etre anonyme et assignee a une variable', 'TRUE_FALSE', '[{\"text\":\"Vrai\",\"isCorrect\":true},{\"text\":\"Faux\",\"isCorrect\":false}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 4),
(56, 39, 'Expliquez brièvement : LES OBJETS\r\nLes objets permettent de regrouper des proprietes', 'SHORT_ANSWER', 'null', 'Réponse attendue générée en simulation.', 'Réponse générée en mode simulation.', 2, 'MEDIUM', 5),
(57, 39, 'Concernant \"On accede aux proprietes avec la notation point...\", quelle affirmation est correcte ?', 'MULTIPLE_CHOICE', '[{\"text\":\"Affirmation A (correcte)\",\"isCorrect\":true},{\"text\":\"Affirmation B\",\"isCorrect\":false},{\"text\":\"Affirmation C\",\"isCorrect\":false},{\"text\":\"Affirmation D\",\"isCorrect\":false}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 6),
(58, 39, 'Vrai ou Faux : LES TABLEAUX\r\nLes tableaux stockent des valeurs indexees', 'TRUE_FALSE', '[{\"text\":\"Vrai\",\"isCorrect\":false},{\"text\":\"Faux\",\"isCorrect\":true}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 7),
(59, 39, 'Expliquez brièvement : La methode map transforme chaque element', 'SHORT_ANSWER', 'null', 'Réponse attendue générée en simulation.', 'Réponse générée en mode simulation.', 2, 'MEDIUM', 8),
(60, 39, 'Concernant \"La methode filter selectionne certains elements...\", quelle affirmation est correcte ?', 'MULTIPLE_CHOICE', '[{\"text\":\"Affirmation A (correcte)\",\"isCorrect\":true},{\"text\":\"Affirmation B\",\"isCorrect\":false},{\"text\":\"Affirmation C\",\"isCorrect\":false},{\"text\":\"Affirmation D\",\"isCorrect\":false}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 9),
(61, 40, 'Concernant \"Leçon : La Programmation Orientée Objet en PHP  Niveau : Débutant à intermédiair...\", quelle affirmation est correcte ?', 'MULTIPLE_CHOICE', '[{\"text\":\"Affirmation A (correcte)\",\"isCorrect\":true},{\"text\":\"Affirmation B\",\"isCorrect\":false},{\"text\":\"Affirmation C\",\"isCorrect\":false},{\"text\":\"Affirmation D\",\"isCorrect\":false}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 0),
(62, 40, 'Vrai ou Faux : Objectifs de la leçon  À la fin de cette leçon, l\'apprenant doit être capable de :  • Expliquer les notions de classe, d', 'TRUE_FALSE', '[{\"text\":\"Vrai\",\"isCorrect\":false},{\"text\":\"Faux\",\"isCorrect\":true}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 1),
(63, 40, 'Expliquez brièvement : • Créer et instancier une classe en PHP', 'SHORT_ANSWER', 'null', 'Réponse attendue générée en simulation.', 'Réponse générée en mode simulation.', 2, 'MEDIUM', 2),
(64, 40, 'Concernant \"• Utiliser l\'encapsulation avec les niveaux de visibilité...\", quelle affirmation est correcte ?', 'MULTIPLE_CHOICE', '[{\"text\":\"Affirmation A (correcte)\",\"isCorrect\":true},{\"text\":\"Affirmation B\",\"isCorrect\":false},{\"text\":\"Affirmation C\",\"isCorrect\":false},{\"text\":\"Affirmation D\",\"isCorrect\":false}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 3),
(65, 40, 'Vrai ou Faux : • Appliquer l\'héritage, les interfaces et les classes abstraites', 'TRUE_FALSE', '[{\"text\":\"Vrai\",\"isCorrect\":true},{\"text\":\"Faux\",\"isCorrect\":false}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 4),
(66, 40, 'Expliquez brièvement : • Comprendre le polymorphisme et les méthodes statiques', 'SHORT_ANSWER', 'null', 'Réponse attendue générée en simulation.', 'Réponse générée en mode simulation.', 2, 'MEDIUM', 5),
(67, 40, 'Concernant \"Introduction  La programmation orientée objet (POO) est une façon d\'organiser le...\", quelle affirmation est correcte ?', 'MULTIPLE_CHOICE', '[{\"text\":\"Affirmation A (correcte)\",\"isCorrect\":true},{\"text\":\"Affirmation B\",\"isCorrect\":false},{\"text\":\"Affirmation C\",\"isCorrect\":false},{\"text\":\"Affirmation D\",\"isCorrect\":false}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 6),
(68, 40, 'Vrai ou Faux : Un objet regroupe des données (propriétés) et des comportements (méthodes)', 'TRUE_FALSE', '[{\"text\":\"Vrai\",\"isCorrect\":false},{\"text\":\"Faux\",\"isCorrect\":true}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 7),
(69, 40, 'Expliquez brièvement : En PHP, la POO permet de créer des applications plus structurées, réutilisables, testables et facile', 'SHORT_ANSWER', 'null', 'Réponse attendue générée en simulation.', 'Réponse générée en mode simulation.', 2, 'MEDIUM', 8),
(70, 40, 'Concernant \"Exemple concret : au lieu d\'écrire séparément le nom, le prix et les fonctions d...\", quelle affirmation est correcte ?', 'MULTIPLE_CHOICE', '[{\"text\":\"Affirmation A (correcte)\",\"isCorrect\":true},{\"text\":\"Affirmation B\",\"isCorrect\":false},{\"text\":\"Affirmation C\",\"isCorrect\":false},{\"text\":\"Affirmation D\",\"isCorrect\":false}]', NULL, 'Réponse générée en mode simulation.', 1, 'MEDIUM', 9);

-- --------------------------------------------------------

--
-- Structure de la table `receipts`
--

CREATE TABLE `receipts` (
  `id` int(11) NOT NULL,
  `reference` varchar(191) NOT NULL,
  `payment_id` int(11) NOT NULL,
  `file_url` varchar(191) DEFAULT NULL,
  `generated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `receipts`
--

INSERT INTO `receipts` (`id`, `reference`, `payment_id`, `file_url`, `generated_at`) VALUES
(3, 'REC-2026-0001', 3, '/uploads/receipts/REC-2026-0001.pdf', '2026-10-17 06:40:27.281'),
(4, 'REC-2026-0002', 4, '/uploads/receipts/REC-2026-0002.pdf', '2026-10-17 06:51:28.883'),
(5, 'REC-2026-0003', 5, '/uploads/receipts/REC-2026-0003.pdf', '2026-11-06 05:33:55.989');

-- --------------------------------------------------------

--
-- Structure de la table `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `id` int(11) NOT NULL,
  `token` varchar(500) NOT NULL,
  `user_id` int(11) NOT NULL,
  `expires_at` datetime(3) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`id`, `token`, `user_id`, `expires_at`, `created_at`) VALUES
(40, 'f056b7488903cf81183c96977813731daca13c3461277bf50eb6aaa18e9b26999c37b8a75b7726d10c6c9bf7c88057de072c5e584aca3801ab2a8c3674e95129', 1, '2026-10-19 11:44:08.668', '2026-09-19 11:44:08.675'),
(41, '7882e4bfe299e4788621de1d284c054893a844346dfd3b398cac97cffda5c43075cc112f4988611edb0f8757c6fbac3ac48853b96aaca53330030b5db1d96d31', 1, '2026-10-19 12:10:54.703', '2026-09-19 12:10:54.709'),
(43, '315e9e525d919a9f36cccbdae6356a68b4ec1edb2d252141ff1e90d1afdcaf8b6d0bff3b629eaf2f59a00759e5ab6af05f6e90af2ebb835289fba77f3b3e145a', 1, '2026-10-19 12:22:07.611', '2026-09-19 12:22:07.619'),
(46, '0612b7d6947944c68cefe55424a7c6556d37fb2e08a054c4797cedf861518f5928e5ee5878d03bf017f3a72ad43e1255f668954b4c73ad48cf91297c652a11be', 1, '2026-10-19 12:43:26.586', '2026-09-19 12:43:26.588'),
(49, '9f74759d5676676c3fd395dc5fccfbb3fe1b09cfa025122f3c1fc38c6197d7e3978d27fb35dbc4c3021801b4cc0258e7a26f446caea51ba3b5dcdf6b980d1937', 1, '2026-10-19 12:49:25.451', '2026-09-19 12:49:25.455'),
(52, 'af29786141e91492f37da4b3fde77496c2e90888fc8c5ce52c19b1dde2020a82559ba413b2dc98894c0e95f21e2918dca314345e00e2d42dfbc50440d7b216fb', 1, '2026-10-19 14:35:28.926', '2026-09-19 14:35:28.935'),
(58, 'b994c4e00e0133d075614edc81872e904c954019eedf8a594beb9c732a88bb3bf8a6937af9531f55fa266551c65c65b8462550ddf4fe2541b1b59cf3ce8a36ed', 1, '2026-10-19 15:13:29.260', '2026-09-19 15:13:29.261'),
(61, '0244527a0c51598051cd51a97661d049877b7e5e008f26b5cd8ccbf67e7e87c3cf5e6c2d25360a5fd9019f3a787b8e4d25a6598e89c817fd522c425a1bbdcba7', 1, '2026-10-19 15:29:43.602', '2026-09-19 15:29:43.608'),
(64, 'f00ba6f79d5e89e0beecde307b8ad0ab30013866dbb8cee770b1cfe03b749fa3e0a56279b56582b319f9fd1103d94f83cd83d68d0a518343445f5981c5ce52c0', 1, '2026-10-19 15:39:29.050', '2026-09-19 15:39:29.052'),
(77, '91b5a28d64a08422f8c658022e96647d47f4355d3633789167077f72bfed6517972951011084edaac5d34c1d539e6d8355b5c4e1ff171fd2f41b85201b5acf22', 1, '2026-10-19 17:51:22.246', '2026-09-19 17:51:22.249'),
(79, '80070911d79b07d287e21de5950d73ef25e48c0242215b9c14980dbb4c5077d1e506235ad9aceb6b0b33a8e7203998eba47cc375bb87d5ae1af8011e2339a7ac', 1, '2026-10-19 18:54:03.104', '2026-09-19 18:54:03.116'),
(80, '203ff1e9dd4f61334c4bfe724beb12495096aa8667b23e7d735320c789bc7ebb10e8ee52d65631be455916d8677ce124c72a2c672795e1e8551f8e0c06c7ea18', 1, '2026-10-19 18:59:17.143', '2026-09-19 18:59:17.145'),
(81, 'bf7f7023c104423428592d2c332dbc89c30bc5f1d39c71757bec188d6df73da3feccd7ea3cbd745293a19a1c3654f1e8963224e61b0ce0843b3e8ae776b9fd52', 1, '2026-10-19 19:00:27.084', '2026-09-19 19:00:27.093'),
(96, 'b36cc15d15a61918c77f9a744430c743dcc613a29d88503b0270370b172630c6987d4315703a299d9efdef757823dcda9dd79b94fa66671583d10a25675fe97e', 1, '2026-10-19 23:05:10.172', '2026-09-19 23:05:10.176'),
(99, 'ac1c8171fc7adb86b30498e9d56a86c2d20bbcff01b7ec291a202acf4e3cd048582525bceccc9ca784888dff31447b9d3e36717b02dca4a366f05d32f44269be', 1, '2026-10-19 23:13:52.582', '2026-09-19 23:13:52.588'),
(101, 'cca76e04c7010a4e4bc69e887eb4a79b5e15e4dc6364d4d2c494b11f38abe42bef8c0243d3eefef392fb044c559671c10c7578f8c1df73e43e3b5e7a8f7f695a', 1, '2026-10-19 23:38:04.420', '2026-09-19 23:38:04.425'),
(115, '4f0f2eade06ea81c0ae072a3cd473fdf953aa4cf366174f1ba4ea509fbd3e32f0ff0a40fcf3d607c9e96c1657a8a28db0d4279b14a9eae8150c11533ed17945e', 1, '2026-10-21 08:20:44.575', '2026-09-21 08:20:44.578'),
(116, '9bada02be1d1aeec34cfc1e0c6482ddaaae2ddbba0c57a9d8f4c83c34228be499c7fa9470ad5747f6bd52cc92acffffacbf20214e567609a0c84d72a47b8a5e4', 1, '2026-10-21 08:40:28.396', '2026-09-21 08:40:28.398'),
(118, '9fb2704a1f98cbf38972d0a49e7c13ca9d0e5a46c6d19f72240f6ca0a5bc299a20bfcb783324c07b4600fc3b105f3e03b201b0fd6566270c4e00f23877f08f96', 1, '2026-10-21 09:26:22.138', '2026-09-21 09:26:22.148'),
(119, 'a7ab92769188cbc0fbfb3b4d208e977cbea5bd126e562705f499da03a804725eabc51be69bd821c5f8d397fb40709894dcfdd679723741ac9eaa6fa943fe2b24', 1, '2026-10-21 09:34:46.471', '2026-09-21 09:34:46.474'),
(120, '17c5dc205f82399d8d443cd7146aa537b3cf642110b9581e8dcaaffad8c6fd4b3d2f7246544a37832a5471cde7a954434f82f87d00d49bf22665ef1f7c6f269b', 1, '2026-10-21 09:51:09.314', '2026-09-21 09:51:09.318'),
(121, '2ffdcd357c1448a579976169348ab00f8b6a794dbd7898e2aeac8a7e391217311f7d282b0fa87294adad9732372229982f6a3414b5f976b28378a4e9c919b1a9', 1, '2026-10-21 09:53:49.614', '2026-09-21 09:53:49.618'),
(122, 'b1c45375da780fcad8b49c943cda159f6b0a6900e5a297526b30966fed9202d915634067dafae50a83672d25c757c8b0ef065ebf899bc920e564efe3ebbff2a0', 1, '2026-10-21 10:53:18.102', '2026-09-21 10:53:18.108'),
(123, '5d26413bf7858a70ca06117dfd57b153c7fe1ae5f82b4dac3d7723ff0b20cdda31e987acc060140da7592ae6abc834dc4682f32b981d3e79e87932f82bb6b466', 1, '2026-10-21 10:57:22.296', '2026-09-21 10:57:22.297'),
(124, 'b1333fe1bd8ecbeea70452e77fbd0a4a919e5f4c42567e0f9dc6335ced5d50d5c81f25f13160c3c3ecd2680b2b74e0b55be0002f539d00db952e3880abb59a33', 1, '2026-10-23 06:53:04.588', '2026-09-23 06:53:04.591'),
(131, '7975e057158303ce367bbe4cbbbc7aa10ca0b467c119fe0dc79c02b01637eadd848e91512cc34cb5b5e043af9e7dc51b470faffbcfea042cdeb7c14c68fe7488', 1, '2026-10-24 18:13:04.787', '2026-09-24 18:13:04.807'),
(153, '2b61e8bd2a437cec5ffb37e47392656b8be501be23bf457e163fe7712727ebc00f791c0ef3edab72674a1210205fb6b5245175a0cd6bd6f5877315721e8e5bed', 11, '2026-10-26 04:40:35.534', '2026-09-26 04:40:35.542'),
(168, 'e6139e84d78c5bc1a89d7724d7fa21abd2768903cc41624c97f093b8f91cfd06114edad77bc7b0035c634e58554029d86e4d9d12428d63c42b804fcb80dc4de3', 11, '2026-10-26 12:22:08.831', '2026-09-26 12:22:08.832'),
(195, '74b0654395b88b6eca4a28f23563745f3e4b9bd7b24e33043e3311a9b43a47c044c1fdc710f464a4173229e844897e23716ebd1efefe596858f958a5f6d660bc', 1, '2026-11-10 17:43:59.649', '2026-10-11 17:43:59.655'),
(199, 'a80b4021f8dda47abb59340f3b21aa235813ae952f17ea6dc3324e4d4050bc9afaec21b90c9248fceec0b213c7a49eb1e9387f565bd06a030a09424e3e3ee22b', 11, '2026-11-10 19:01:13.977', '2026-10-11 19:01:13.985'),
(223, '724adbf964e9a4920151e21f614941c0c5e6567252db61ed30c7adca86bc481bd1587923c7493b03bb2c5af9fd5d6931a853bb7d1944ef86e98c374bfdf3fbd4', 1, '2026-11-21 16:30:53.965', '2026-10-22 16:30:53.967'),
(224, '98ad51196a509a85aa22c1b34b90d03143cc15c66e2aae8935600156385a34817c3afa859d64c55dc53c8e42e9632d86a2d21ca5812b9b9c2c8d1f300695cd6d', 11, '2026-11-25 03:46:33.979', '2026-10-26 03:46:33.993'),
(243, 'eac13e173d9b49c156fabd40d5f0dcd76680bad83561ef1e11b24ec7f7cbc749a3edb1476db4e5e2ad6bf9bad1df37e18c93bf0914ae7dfad29fa62b61d50714', 11, '2026-12-10 17:19:31.632', '2026-11-10 17:19:31.634'),
(244, '6e97263757ee5a3f66e652625240f24ec98a5765be2d18b48a3e14d42d260b7d45fd2a2401ee8ad7bad07fbd866996728166f06506595862e773416fce9df295', 11, '2026-12-10 17:21:17.913', '2026-11-10 17:21:17.925'),
(250, '51701d2046a2d62cb6c3ce8fece83a332961166c19a3ee38361cb47fa313952d92ba3d222c2ed6e38376647c1be8aebdbb5f2e1c4f102634a48a72deea38c170', 12, '2026-12-10 18:26:09.756', '2026-11-10 18:26:09.758');

-- --------------------------------------------------------

--
-- Structure de la table `student_discounts`
--

CREATE TABLE `student_discounts` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `discount_id` int(11) NOT NULL,
  `academic_year` varchar(191) NOT NULL,
  `approved_by_id` int(11) DEFAULT NULL,
  `approved_at` datetime(3) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `student_enrollments`
--

CREATE TABLE `student_enrollments` (
  `id` int(11) NOT NULL,
  `reference` varchar(191) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `applicant_email` varchar(191) NOT NULL,
  `applicant_name` varchar(191) NOT NULL,
  `personal_info` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`personal_info`)),
  `contact_info` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`contact_info`)),
  `documents` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`documents`)),
  `previous_education` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`previous_education`)),
  `desired_class_id` int(11) DEFAULT NULL,
  `desired_program_id` int(11) DEFAULT NULL,
  `status` enum('PENDING_DOCUMENTS','PENDING_REVIEW','PENDING_PAYMENT','ENROLLED','COMPLETED','REPEATED','FAILED','WITHDRAWN','CANCELLED','REJECTED') NOT NULL DEFAULT 'PENDING_DOCUMENTS',
  `academic_year` varchar(191) NOT NULL,
  `final_result` enum('ADMIS','REDOUBLE','EXCLU') DEFAULT NULL,
  `final_average` decimal(5,2) DEFAULT NULL,
  `validated_credits` int(11) DEFAULT NULL,
  `total_credits` int(11) DEFAULT NULL,
  `final_decision_at` datetime(3) DEFAULT NULL,
  `final_decision_by_id` int(11) DEFAULT NULL,
  `previous_enrollment_id` int(11) DEFAULT NULL,
  `is_reenrollment` tinyint(1) NOT NULL DEFAULT 0,
  `is_repeating` tinyint(1) NOT NULL DEFAULT 0,
  `is_late_reenrollment` tinyint(1) NOT NULL DEFAULT 0,
  `late_penalty` decimal(12,2) DEFAULT NULL,
  `reviewed_by_id` int(11) DEFAULT NULL,
  `reviewed_at` datetime(3) DEFAULT NULL,
  `review_notes` text DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `reenrollment_deadline` datetime(3) DEFAULT NULL,
  `suspended_at` datetime(3) DEFAULT NULL,
  `blocked_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `academic_year_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `student_enrollments`
--

INSERT INTO `student_enrollments` (`id`, `reference`, `student_id`, `applicant_email`, `applicant_name`, `personal_info`, `contact_info`, `documents`, `previous_education`, `desired_class_id`, `desired_program_id`, `status`, `academic_year`, `final_result`, `final_average`, `validated_credits`, `total_credits`, `final_decision_at`, `final_decision_by_id`, `previous_enrollment_id`, `is_reenrollment`, `is_repeating`, `is_late_reenrollment`, `late_penalty`, `reviewed_by_id`, `reviewed_at`, `review_notes`, `rejection_reason`, `reenrollment_deadline`, `suspended_at`, `blocked_at`, `created_at`, `updated_at`, `academic_year_id`) VALUES
(1, 'INS-2026-0001', NULL, 'nouveau@test.mg', 'RAKOTO Marie', '{\"birthDate\":\"2000-05-15\",\"firstName\":\"Marie\",\"gender\":\"F\",\"lastName\":\"RAKOTO\"}', '{\"phone\":\"+261 34 12 345 67\",\"address\":\"Antananarivo\"}', 'null', 'null', NULL, NULL, 'PENDING_PAYMENT', '2025-2026', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-21 08:20:46.956', '2026-09-21 08:20:46.956', NULL),
(2, 'INS-2026-0002', NULL, 'marie.rakoto@test.mg', 'RAKOTO Marie', '{\"birthDate\":\"2000-05-15\",\"lastName\":\"RAKOTO\",\"gender\":\"F\",\"nationality\":\"Malagasy\",\"firstName\":\"Marie\",\"birthPlace\":\"Antananarivo\"}', '{\"phone\":\"+261 34 90 332 332\",\"address\":\"Antananarivo, Madagascar\"}', 'null', 'null', 19, NULL, 'PENDING_PAYMENT', '2025-2026', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-21 09:26:24.392', '2026-09-21 09:26:24.392', NULL),
(3, 'INS-2026-0003', NULL, 'jean.rabe@test.mg', 'RABE Jean', '{\"birthDate\":\"2001-03-22\",\"lastName\":\"RABE\",\"gender\":\"M\",\"nationality\":\"Malagasy\",\"firstName\":\"Jean\",\"birthPlace\":\"Antananarivo\"}', '{\"phone\":\"+261 34 29 298 298\",\"address\":\"Antananarivo, Madagascar\"}', 'null', 'null', 19, NULL, 'PENDING_PAYMENT', '2025-2026', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-21 09:26:24.750', '2026-09-21 09:26:24.750', NULL),
(4, 'INS-2026-0004', NULL, 'sophie.martin@test.mg', 'MARTIN Sophie', '{\"birthDate\":\"1999-11-08\",\"lastName\":\"MARTIN\",\"gender\":\"F\",\"nationality\":\"Malagasy\",\"firstName\":\"Sophie\",\"birthPlace\":\"Antananarivo\"}', '{\"phone\":\"+261 34 74 746 746\",\"address\":\"Antananarivo, Madagascar\"}', 'null', 'null', 19, NULL, 'PENDING_PAYMENT', '2025-2026', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-21 09:26:24.907', '2026-09-21 09:26:24.907', NULL),
(5, 'INS-2026-0005', NULL, 'pierre.dupont@test.mg', 'DUPONT Pierre', '{\"birthDate\":\"2002-07-30\",\"lastName\":\"DUPONT\",\"gender\":\"M\",\"nationality\":\"Malagasy\",\"firstName\":\"Pierre\",\"birthPlace\":\"Antananarivo\"}', '{\"phone\":\"+261 34 34 345 345\",\"address\":\"Antananarivo, Madagascar\"}', 'null', 'null', 19, NULL, 'PENDING_PAYMENT', '2025-2026', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-21 09:26:24.954', '2026-09-21 09:26:24.954', NULL),
(6, 'INS-2026-0006', NULL, 'hery.andria@test.mg', 'ANDRIANARIVO Hery', '{\"birthDate\":\"2000-12-03\",\"lastName\":\"ANDRIANARIVO\",\"gender\":\"M\",\"nationality\":\"Malagasy\",\"firstName\":\"Hery\",\"birthPlace\":\"Antananarivo\"}', '{\"phone\":\"+261 34 83 843 843\",\"address\":\"Antananarivo, Madagascar\"}', 'null', 'null', 19, NULL, 'PENDING_PAYMENT', '2025-2026', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-21 09:26:24.989', '2026-09-21 09:26:24.989', NULL),
(7, 'INS-2026-0007', NULL, 'lova.rasoa@test.mg', 'RASOAMANANA Lova', '{\"birthDate\":\"2001-09-19\",\"lastName\":\"RASOAMANANA\",\"gender\":\"F\",\"nationality\":\"Malagasy\",\"firstName\":\"Lova\",\"birthPlace\":\"Antananarivo\"}', '{\"phone\":\"+261 34 43 442 442\",\"address\":\"Antananarivo, Madagascar\"}', 'null', 'null', 19, NULL, 'PENDING_PAYMENT', '2025-2026', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-21 09:26:25.035', '2026-09-21 09:26:25.035', NULL),
(8, 'INS-2026-0008', NULL, 'toky.rakoto@test.mg', 'RAKOTOMALALA Toky', '{\"birthDate\":\"2003-04-12\",\"lastName\":\"RAKOTOMALALA\",\"gender\":\"M\",\"nationality\":\"Malagasy\",\"firstName\":\"Toky\",\"birthPlace\":\"Antananarivo\"}', '{\"phone\":\"+261 34 93 940 940\",\"address\":\"Antananarivo, Madagascar\"}', 'null', 'null', 19, NULL, 'PENDING_PAYMENT', '2025-2026', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-21 09:26:25.081', '2026-09-21 09:26:25.081', NULL),
(9, 'INS-2026-0009', NULL, 'miora.razafy@test.mg', 'RAZAFY Miora', '{\"birthDate\":\"2000-08-25\",\"lastName\":\"RAZAFY\",\"gender\":\"F\",\"nationality\":\"Malagasy\",\"firstName\":\"Miora\",\"birthPlace\":\"Antananarivo\"}', '{\"phone\":\"+261 34 53 539 539\",\"address\":\"Antananarivo, Madagascar\"}', 'null', 'null', 19, NULL, 'REJECTED', '2025-2026', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, 1, '2026-09-21 09:45:29.846', NULL, 'dossier incomplet', NULL, NULL, NULL, '2026-09-21 09:26:25.123', '2026-09-21 09:45:29.853', NULL),
(10, 'INS-2026-0010', NULL, 'hery.test@test.mg', 'ANDRIANARIVO Hery', '{\"birthDate\":\"2000-01-15\",\"firstName\":\"Hery\",\"gender\":\"M\",\"lastName\":\"ANDRIANARIVO\"}', '{\"phone\":\"+261 34 00 000 00\",\"address\":\"Antananarivo\"}', 'null', 'null', NULL, NULL, 'PENDING_PAYMENT', '2025-2026', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, 1, '2026-09-21 15:22:45.415', NULL, NULL, NULL, NULL, NULL, '2026-09-21 09:34:46.548', '2026-09-21 15:22:45.444', NULL),
(11, 'INS-2026-0011', NULL, 'lova.test@test.mg', 'RASOAMANANA Lova', '{\"birthDate\":\"2000-01-15\",\"firstName\":\"Lova\",\"gender\":\"M\",\"lastName\":\"RASOAMANANA\"}', '{\"phone\":\"+261 34 00 000 00\",\"address\":\"Antananarivo\"}', 'null', 'null', 19, NULL, 'PENDING_PAYMENT', '2025-2026', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, 1, '2026-09-21 10:57:22.363', 'Test', NULL, NULL, NULL, NULL, '2026-09-21 09:34:46.609', '2026-09-21 10:57:22.365', NULL),
(12, 'INS-2026-0012', NULL, 'toky.test@test.mg', 'RAKOTOMALALA Toky', '{\"birthDate\":\"2000-01-15\",\"firstName\":\"Toky\",\"gender\":\"M\",\"lastName\":\"RAKOTOMALALA\"}', '{\"phone\":\"+261 34 00 000 00\",\"address\":\"Antananarivo\"}', 'null', 'null', 19, NULL, 'PENDING_PAYMENT', '2025-2026', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, 1, '2026-09-21 10:53:18.196', 'Test', NULL, NULL, NULL, NULL, '2026-09-21 09:34:46.653', '2026-09-21 10:53:18.202', NULL),
(13, 'INS-2026-0013', NULL, 'rasamimananalova2@gmail.com', 'LOVA rasamimanana', '{\"firstName\":\"rasamimanana\",\"lastName\":\"LOVA\",\"gender\":\"M\",\"birthDate\":\"2003-03-16\",\"nationality\":\"Malagasy\"}', '{\"phone\":\"0349162826\",\"address\":\"ANATANANARIVO V\"}', 'null', 'null', 19, NULL, 'PENDING_PAYMENT', '2025-2026', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-21 09:45:06.283', '2026-09-21 09:45:06.283', NULL),
(14, 'INS-2026-0014', NULL, 'anjararaholison2503@gmail.com', 'RAHOLISON ANJARA SAMBATRA', '{\"birthDate\":\"2000-03-25\",\"lastName\":\"RAHOLISON\",\"gender\":\"M\",\"nationality\":\"Malagasy\",\"firstName\":\"Anjara Sambatra\",\"birthPlace\":\"Antananarivo\"}', '{\"phone\":\"+261 34 00 000 00\",\"address\":\"Antananarivo, Madagascar\"}', 'null', 'null', 19, NULL, 'REJECTED', '2025-2026', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, 1, '2026-09-21 15:23:22.669', 'Validation de test pour RAHOLISON Anjara', 'incomplet', NULL, NULL, NULL, '2026-09-21 09:51:09.403', '2026-09-21 15:23:22.676', NULL),
(15, 'INS-2026-0015', NULL, 'anjararaholison2503@gmail.com', 'RAHOLISON Anjara Sambatra', '{\"birthDate\":\"2000-03-25\",\"lastName\":\"RAHOLISON\",\"gender\":\"M\",\"nationality\":\"Malagasy\",\"firstName\":\"Anjara Sambatra\",\"birthPlace\":\"Antananarivo\"}', '{\"phone\":\"+261 34 12 345 67\",\"address\":\"Antananarivo, Madagascar\"}', 'null', 'null', 19, NULL, 'PENDING_PAYMENT', '2025-2026', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, 1, '2026-09-21 09:53:49.875', 'Test de validation automatique', NULL, NULL, NULL, NULL, '2026-09-21 09:53:47.034', '2026-09-21 09:53:49.879', NULL),
(16, 'INS-2026-0016', NULL, 'anjararaholison2503@gmail.com', 'RAHEI naivo', '{\"firstName\":\"naivo\",\"lastName\":\"RAHEI\",\"gender\":\"M\",\"birthDate\":\"2004-03-16\",\"birthPlace\":\"Antananarivo\",\"nationality\":\"Malagasy\"}', '{\"email\":\"anjara.raholison2503@gmail.com\",\"phone\":\"0349162826\",\"city\":\"Antananarivo\",\"address\":\"lot II A73LBis P Ambatomainty\"}', '{}', '{\"diplomas\":[{\"level\":\"\",\"institution\":\"\",\"year\":\"\",\"mention\":\"\"}]}', NULL, 15, 'PENDING_PAYMENT', '2025-2026', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, 1, '2026-09-21 18:56:38.800', NULL, NULL, NULL, NULL, NULL, '2026-09-21 18:54:41.075', '2026-09-21 18:56:38.809', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `teaching_units`
--

CREATE TABLE `teaching_units` (
  `id` int(11) NOT NULL,
  `code` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `semester` enum('S1','S2','S3','S4','S5','S6','S7','S8','S9','S10') DEFAULT NULL,
  `unit_id` int(11) DEFAULT NULL,
  `created_by_id` int(11) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `teaching_units`
--

INSERT INTO `teaching_units` (`id`, `code`, `name`, `description`, `semester`, `unit_id`, `created_by_id`, `created_at`, `updated_at`) VALUES
(1, 'UE-LANG-101', 'Unite d\'enseignement Langues', 'Francais, Anglais, Italien', 'S1', NULL, 1, '2026-09-19 18:59:17.471', '2026-09-19 18:59:17.471'),
(2, 'UE-PRG-301', 'Unite d\'enseignement Programmation', 'Java, PHP, Python', 'S3', NULL, 1, '2026-09-19 18:59:17.528', '2026-09-19 18:59:17.528');

-- --------------------------------------------------------

--
-- Structure de la table `teaching_unit_classes`
--

CREATE TABLE `teaching_unit_classes` (
  `id` int(11) NOT NULL,
  `teaching_unit_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `teaching_unit_classes`
--

INSERT INTO `teaching_unit_classes` (`id`, `teaching_unit_id`, `class_id`, `created_at`) VALUES
(1, 2, 19, '2026-09-19 19:11:03.164'),
(2, 1, 19, '2026-09-19 19:37:06.595');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `first_name` varchar(191) NOT NULL,
  `last_name` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `avatar_url` varchar(191) DEFAULT NULL,
  `role` enum('ADMIN','TEACHER','STUDENT','ACCOUNTANT','PARENT') NOT NULL DEFAULT 'STUDENT',
  `status` enum('ACTIVE','INACTIVE','SUSPENDED','PENDING') NOT NULL DEFAULT 'PENDING',
  `unit_id` int(11) DEFAULT NULL,
  `last_login_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `matricule` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `first_name`, `last_name`, `phone`, `avatar_url`, `role`, `status`, `unit_id`, `last_login_at`, `created_at`, `updated_at`, `matricule`) VALUES
(1, 'admin@lms.local', '$2b$12$tKCBkCS8WN791jJjYRecb.45otHxC92Ofl2kruXqBE4IKicmBmzwS', 'Super', 'Admin', NULL, NULL, 'ADMIN', 'ACTIVE', NULL, '2026-11-10 18:11:46.528', '2026-09-17 19:03:19.435', '2026-11-10 18:11:46.530', NULL),
(11, 'anjararaholison2503@gmail.com', '$2b$12$tC6ysKqQOBDDAvr1zYJlcOMghixsNwh5hAvUikfED6hQao.5eWBtS', 'Anjara', 'Raholison', '0349162826', NULL, 'TEACHER', 'ACTIVE', 11, '2026-11-10 18:24:21.377', '2026-09-25 06:51:03.432', '2026-11-10 18:24:21.384', NULL),
(12, 'nivoramahatana@gmail.com', '$2b$12$zYaA6TH1xekv4j56JDPL3OCknyBqU1Bu.Fi61vNh8iqTPa7Ltr5zS', 'nivo', 'ramahatana', '0349162826', NULL, 'STUDENT', 'ACTIVE', 19, '2026-11-10 18:26:09.736', '2026-09-26 03:20:24.284', '2026-11-10 18:26:09.738', 'ETU-2026-0003'),
(13, 'aina.rakotomalala01@lms.local', '$2b$12$sre8kSy.G3McZw3n5zkYVeGgLNbcRZJyU/jKzh3eFUfW.SBEobU6W', 'Aina', 'Rakotomalala', '+261 34 00 000 00001', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:26.840', '2026-10-09 18:19:26.840', NULL),
(14, 'andry.rakotonirina02@lms.local', '$2b$12$5ymCA9uEa2T7EA/qf4cMmOijn4BKjFQCKb7/XsYE2AJY6CgezExsK', 'Andry', 'Rakotonirina', '+261 34 00 000 00002', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:27.621', '2026-10-09 18:19:27.621', NULL),
(15, 'miora.rakotoarisoa03@lms.local', '$2b$12$TOWGz5QOkH9kH.Poj9E3FeZ55fMXE67z9BMDmr7FnpawtvfiXhrmS', 'Miora', 'Rakotoarisoa', NULL, NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:28.399', '2026-10-09 18:19:28.399', NULL),
(16, 'tiana.rafanomezantsoa04@lms.local', '$2b$12$//lkfCrG3IaZ0AVW87pVee1IIJM/i8zzm2ikn/hkeiU4WZdVgPgkm', 'Tiana', 'Rafanomezantsoa', '+261 34 00 000 00004', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:29.182', '2026-10-09 18:19:29.182', NULL),
(17, 'hasina.rakotoniaina05@lms.local', '$2b$12$ldJmpqbvVr3o9DkGAbl0aeCTpzG1eEoBLifLGF8qurkIcaFM3.pVK', 'Hasina', 'Rakotoniaina', '+261 34 00 000 00005', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:29.948', '2026-10-09 18:19:29.948', NULL),
(18, 'nirina.randrianasolo06@lms.local', '$2b$12$6fz2NSbgFIbLTyDHQPGzBuZwQsZwtGPVAG4g7906RFJMFN1M9E/T.', 'Nirina', 'Randrianasolo', NULL, NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:30.708', '2026-10-09 18:19:30.708', NULL),
(19, 'hery.razafindrakoto07@lms.local', '$2b$12$gGSKtazBipAhSxo6Ad9/fuGIlvnXkiBrY5WT1p6sUzWkJYvrlxYpK', 'Hery', 'Razafindrakoto', '+261 34 00 000 00007', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:31.521', '2026-10-09 18:19:31.521', NULL),
(20, 'fara.raharimalala08@lms.local', '$2b$12$CtrzQg5a4gpqTzjiXbAzT.pBwwcx9MjpxREzEwXB/AZZJivf24/zG', 'Fara', 'Raharimalala', '+261 34 00 000 00008', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:32.309', '2026-10-09 18:19:32.309', NULL),
(21, 'toky.rakotoarimanana09@lms.local', '$2b$12$0iPGKnRV1bvInMDe3a/OMOywnBQ.NsVLKuB69CyV2GzupBzQlNWQy', 'Toky', 'Rakotoarimanana', NULL, NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:33.067', '2026-10-09 18:19:33.067', NULL),
(22, 'lalaina.ranaivoson10@lms.local', '$2b$12$vUpTXuKqgrIZd/urfzpqHOWSI4Db17kc0kk3GIdnFl9i1aWEX3xzC', 'Lalaina', 'Ranaivoson', '+261 34 00 000 00010', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:33.835', '2026-10-09 18:19:33.835', NULL),
(23, 'kanto.andrianjafy11@lms.local', '$2b$12$VoAxRy2Cff7aqHdFPIjNHuyeIugbsP0lafK38HBo3WJAg7cY4EfOK', 'Kanto', 'Andrianjafy', '+261 34 00 000 00011', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:34.598', '2026-10-09 18:19:34.598', NULL),
(24, 'mamy.razafindramanana12@lms.local', '$2b$12$LkJwN/vDpdQgc5i6U0EaWOFM1IBeu8eFUrh.xOyjcVlRwVgG7u4nW', 'Mamy', 'Razafindramanana', NULL, NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:35.362', '2026-10-09 18:19:35.362', NULL),
(25, 'soa.ratsimandresy13@lms.local', '$2b$12$wbDBFq3XXFq.EQ2XKGfEhuMkoTtFiEBF4nyFZ.JmQfcgFMJkkaZji', 'Soa', 'Ratsimandresy', '+261 34 00 000 00013', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:36.127', '2026-10-09 18:19:36.127', NULL),
(26, 'rija.andrianirina14@lms.local', '$2b$12$uRtIxyJbem8L5T39RPZ1x.wK1DYZvKVpQBHIe4qQFzKmFkjkfZxE.', 'Rija', 'Andrianirina', '+261 34 00 000 00014', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:36.894', '2026-10-09 18:19:36.894', NULL),
(27, 'faly.rakotobe15@lms.local', '$2b$12$0be9UYEcEj8ZTLtFXff5b.8QhvmTUUbHJwF74Frl.Xa9//HnvjK.u', 'Faly', 'Rakotobe', NULL, NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:37.659', '2026-10-09 18:19:37.659', NULL),
(28, 'lova.ratsimbazafy16@lms.local', '$2b$12$thqs3s98P.4Fw50ClkziT.GPBVvI9YQAZFWSdZfjqNwKhR4JHJeGC', 'Lova', 'Ratsimbazafy', '+261 34 00 000 00016', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:38.429', '2026-10-09 18:19:38.429', NULL),
(29, 'dina.rasoanaivo17@lms.local', '$2b$12$NctV7vckyh6Q3hH4n2/35uXzd.gx3YW/66eNgOjKK8kbyNrBmJ0Pu', 'Dina', 'Rasoanaivo', '+261 34 00 000 00017', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:39.201', '2026-10-09 18:19:39.201', NULL),
(30, 'haja.ravelomanantsoa18@lms.local', '$2b$12$.hD.5iblKa7FA6QoSM0d1u0DU2eHxZNWt3QOJzYcQbTfj5PNqcUD6', 'Haja', 'Ravelomanantsoa', NULL, NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:40.012', '2026-10-09 18:19:40.012', NULL),
(31, 'voahirana.ramaroson19@lms.local', '$2b$12$NpSr1ikLCdXT5N23ggjlTuvhGhkQyKTXClFjKfQ7NIFw3FJATca/G', 'Voahirana', 'Ramaroson', '+261 34 00 000 00019', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:40.885', '2026-10-09 18:19:40.885', NULL),
(32, 'nantenaina.rakotondrazaka20@lms.local', '$2b$12$cLisGbS1bzZq2cVvOmzT7e/gAt/24vR1hwwDbWzycGKmnXEJcvsca', 'Nantenaina', 'Rakotondrazaka', '+261 34 00 000 00020', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:41.647', '2026-10-09 18:19:41.647', NULL),
(33, 'tahina.andriamihaja21@lms.local', '$2b$12$Cgs0UyW7JenyC.R6PgQOrO5s.7uMrYUi8ZYPAHvqzIbj9agPv9KT2', 'Tahina', 'Andriamihaja', NULL, NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:42.419', '2026-10-09 18:19:42.419', NULL),
(34, 'miangaly.randriamampionona22@lms.local', '$2b$12$ekVzkaip/4jXj1NszJ15WeAKNBTRXfyguIdIPr7LlQsIT4vcwDE12', 'Miangaly', 'Randriamampionona', '+261 34 00 000 00022', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:43.204', '2026-10-09 18:19:43.204', NULL),
(35, 'solofo.ratsimbazafy23@lms.local', '$2b$12$vFTfgixid5KtmlMCPSw1rezqRLq7VA9OdBk0S/7GDZiiF84iXy6GG', 'Solofo', 'Ratsimbazafy', '+261 34 00 000 00023', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:43.995', '2026-10-09 18:19:43.995', NULL),
(36, 'fenitra.rakotondrainibe24@lms.local', '$2b$12$97r6FRJTye.lMSMlk/tlL.AWucRj6yFupfC/UipkhxJJjpY.9xwBO', 'Fenitra', 'Rakotondrainibe', NULL, NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:44.758', '2026-10-09 18:19:44.758', NULL),
(37, 'mialy.razanadahy25@lms.local', '$2b$12$U.mPnh4uBPGg3nlQGmlA.e3gXjXALlNk1PZzCgNQLR/azM7h64CJO', 'Mialy', 'Razanadahy', '+261 34 00 000 00025', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:45.560', '2026-10-09 18:19:45.560', NULL),
(38, 'fitia.ravelojaona26@lms.local', '$2b$12$bTV3RPcRKdoraNGwIgL2yu2ItdCKPL8hiWbkZMGx7S5NQtQu/Ex6a', 'Fitia', 'Ravelojaona', '+261 34 00 000 00026', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:46.327', '2026-10-09 18:19:46.327', NULL),
(39, 'fanilo.andriatsima27@lms.local', '$2b$12$Mf9nkk9xhqOMZHcw4oGQ6./w4D.5CHBxWuB01dsClSQ53qQJ9VnlS', 'Fanilo', 'Andriatsima', NULL, NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:47.089', '2026-10-09 18:19:47.089', NULL),
(40, 'tsanta.rasolofonirina28@lms.local', '$2b$12$fgWJpJ7d2Yur/FjwubG7GuXu2Gul1xnOXSOkaw.4w52WLcx0WOb7.', 'Tsanta', 'Rasolofonirina', '+261 34 00 000 00028', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:47.888', '2026-10-09 18:19:47.888', NULL),
(41, 'harena.rakotomanga29@lms.local', '$2b$12$1YOxqjHjtgiNt2etuvXO9O7096kLIJJLRmxrLHK.B8FCtRNAvuNUK', 'Harena', 'Rakotomanga', '+261 34 00 000 00029', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:48.658', '2026-10-09 18:19:48.658', NULL),
(42, 'fanja.randrianarisoa30@lms.local', '$2b$12$p0gzJGIq2jxrKCSIc57k6eHr1ko9y71bP4rLxhrUUFHmjHj1isCpO', 'Fanja', 'Randrianarisoa', NULL, NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:49.425', '2026-10-09 18:19:49.425', NULL),
(43, 'lanto.rafalimanana31@lms.local', '$2b$12$k9ptHJMLyHf1uz0XAdQdDOScB8vOcaXyOGDO4CB4L5KxCt1fp4yui', 'Lanto', 'Rafalimanana', '+261 34 00 000 00031', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:50.192', '2026-10-09 18:19:50.192', NULL),
(44, 'voahangy.ramarolahy32@lms.local', '$2b$12$5emDkz5JDLRuI6rg/pOgjuaiJhq.8C0dSqTfQRnBdjt/kubjQueUO', 'Voahangy', 'Ramarolahy', '+261 34 00 000 00032', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:50.955', '2026-10-09 18:19:50.955', NULL),
(45, 'zo.rajaonarison33@lms.local', '$2b$12$m7V/aNezCS/5JuWEssQX5uSFjB92ewGtw6g8NK.6z/9Vs1ZhFYLWS', 'Zo', 'Rajaonarison', NULL, NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:51.722', '2026-10-09 18:19:51.722', NULL),
(46, 'tovo.rakotozafy34@lms.local', '$2b$12$xuz2X5Zw.uJChxmYje.ZEOaOkE1XW0f4jcW9AtlNtaq8GDzumPjZC', 'Tovo', 'Rakotozafy', '+261 34 00 000 00034', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:52.492', '2026-10-09 18:19:52.492', NULL),
(47, 'fetra.ratsivalaka35@lms.local', '$2b$12$xy6Eac4v.oT8AjDTYJI9COwzK0.rsxKGEDJrXUgXNgzUrItVKLZNK', 'Fetra', 'Ratsivalaka', '+261 34 00 000 00035', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:53.261', '2026-10-09 18:19:53.261', NULL),
(48, 'njaka.andriambelo36@lms.local', '$2b$12$BTTwr3CTt.L8jrkNPW0IR.YugH1AzNPu.RPd3Q/sFAdJLVllTuwxy', 'Njaka', 'Andriambelo', NULL, NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:54.072', '2026-10-09 18:19:54.072', NULL),
(49, 'sitraka.raveloson37@lms.local', '$2b$12$cIRr9VjspsaQ3BZkCTBeEeHPJjdQCQuUaQlly.SU8rGNVH5p55uOO', 'Sitraka', 'Raveloson', '+261 34 00 000 00037', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:54.838', '2026-10-09 18:19:54.838', NULL),
(50, 'ony.rakotondrabe38@lms.local', '$2b$12$JvJPQEvpP9TjCooQeLObruGbqs3liRIGEpjEs8eF2kIiEvPj0VhOy', 'Ony', 'Rakotondrabe', '+261 34 00 000 00038', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:55.662', '2026-10-09 18:19:55.662', NULL),
(51, 'manda.razafindralambo39@lms.local', '$2b$12$tklZnpRFkaozdDfhXS9FiOUnwKGK9TDFMhdOcs33sFR.X8EH8gJUy', 'Manda', 'Razafindralambo', NULL, NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:56.624', '2026-10-09 18:19:56.624', NULL),
(52, 'hoby.rasoazanany40@lms.local', '$2b$12$5QVZHRo3S09T.KrbVn71zOzCyVR6X8pxbsKakztCO0.NIz5R3fo2.', 'Hoby', 'Rasoazanany', '+261 34 00 000 00040', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:57.394', '2026-10-09 18:19:57.394', NULL),
(53, 'miora.randriatsiferana41@lms.local', '$2b$12$FiVDWPGY21CZHiwS7/Y9quUA7GQZauPGAhARIv6X/jWqJP80DL0Mi', 'Miora', 'Randriatsiferana', '+261 34 00 000 00041', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:58.166', '2026-10-09 18:19:58.166', NULL),
(54, 'aro.rakotondramanana42@lms.local', '$2b$12$cGNKsbmewBb8DkSiAkNnyOFU29B2rwoRLK3d70X1wjJNFeSczwQAa', 'Aro', 'Rakotondramanana', NULL, NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:58.933', '2026-10-09 18:19:58.933', NULL),
(55, 'miora.razanamihaja43@lms.local', '$2b$12$h8cv1qiUj0ZIusL6S.Aq8.6/4xWUd4jJ2yHCEiYIf4SEiL0aajAVC', 'Miora', 'Razanamihaja', '+261 34 00 000 00043', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:19:59.695', '2026-10-09 18:19:59.695', NULL),
(56, 'tahiry.rafidimanana44@lms.local', '$2b$12$4.PP7bnkqdQp5CjCEZW0P.erztLpoajlC2rcSh/nb8I1mTypr0FHO', 'Tahiry', 'Rafidimanana', '+261 34 00 000 00044', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:20:00.462', '2026-10-09 18:20:00.462', NULL),
(57, 'tanjona.rakoto45@lms.local', '$2b$12$meCT5nem5GaOt9RPZbliMu/xrEJFh96R/NdFhmOq30kq3tkbsJ9CG', 'Tanjona', 'Rakoto', NULL, NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:20:01.233', '2026-10-09 18:20:01.233', NULL),
(58, 'ravaka.andriamampianina46@lms.local', '$2b$12$6CWdMaSnZWsYzcuAcHouyeHerLJlrG5/p6nBO1vN610ghT.p0i8sK', 'Ravaka', 'Andriamampianina', '+261 34 00 000 00046', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:20:01.994', '2026-10-09 18:20:01.994', NULL),
(59, 'noro.rasolondraibe47@lms.local', '$2b$12$OjiM1rb3yeTrNNvrhu2/GOqaZPWe9yC5o5u65IWZn65rWZpqBqBbq', 'Noro', 'Rasolondraibe', '+261 34 00 000 00047', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:20:02.805', '2026-10-09 18:20:02.805', NULL),
(60, 'iary.rakotondrazafy48@lms.local', '$2b$12$Vz/9fZAkgFGB5yFakywIsOLn4yhNHQOsCLCW8dOz8MRqQuCRNxIJm', 'Iary', 'Rakotondrazafy', NULL, NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:20:03.601', '2026-10-09 18:20:03.601', NULL),
(61, 'voary.ratsimbarison49@lms.local', '$2b$12$NdxNbE7E6BBoQgbdotQ6Z.x4YWk7JnpS.qZy9Juw.ft0EnqAUTF5W', 'Voary', 'Ratsimbarison', '+261 34 00 000 00049', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:20:04.445', '2026-10-09 18:20:04.445', NULL),
(62, 'lisy.ratsimbazafy50@lms.local', '$2b$12$bL6CXcGcU9QE7IZc9Yqf9.ef/ekGT2VI5brTN.zJFRllpGfFjgruq', 'Lisy', 'Ratsimbazafy', '+261 34 00 000 00050', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:20:05.214', '2026-10-09 18:20:05.214', NULL),
(63, 'soa.ravonimanantsoa51@lms.local', '$2b$12$JA6p5pR9Mthkt/VvCC53k..ih/PoJ.wcmfWFEk/yI/It4bOJXNyAu', 'Soa', 'Ravonimanantsoa', NULL, NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:20:05.986', '2026-10-09 18:20:05.986', NULL),
(64, 'mialy.rakotondrainy52@lms.local', '$2b$12$lcwbZjXZlRQ5j0MG.nKVIegmQk4XP4BFze9IXpv8vyvxyF3et1h8G', 'Mialy', 'Rakotondrainy', '+261 34 00 000 00052', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:20:06.745', '2026-10-09 18:20:06.745', NULL),
(65, 'tojo.raharison53@lms.local', '$2b$12$v9rU3SLiqUwI0sPSGF1HbOAE26uf1TrREIZnVKGntEluEM9eWiC/2', 'Tojo', 'Raharison', '+261 34 00 000 00053', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:20:07.602', '2026-10-09 18:20:07.602', NULL),
(66, 'hanta.andriamparany54@lms.local', '$2b$12$x4ycry6SoqlM6p1xPWrg/.8i.amt2DuvQvB36lMPl31dTB9FPrvTy', 'Hanta', 'Andriamparany', NULL, NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:20:08.385', '2026-10-09 18:20:08.385', NULL),
(67, 'hasina.ravelonarivo55@lms.local', '$2b$12$hrU49.TmwNj476ReNxfeFulCw6jHCKXLif0hM5p2GXvnv0fhflea2', 'Hasina', 'Ravelonarivo', '+261 34 00 000 00055', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:20:09.156', '2026-10-09 18:20:09.156', NULL),
(68, 'fanja.ratsirahonana56@lms.local', '$2b$12$Ra8hyrUSqAFd6sw4CAvMTe7oKH2GrpsVh9dJkKCRMwU7hDCrpq66i', 'Fanja', 'Ratsirahonana', '+261 34 00 000 00056', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:20:09.929', '2026-10-09 18:20:09.929', NULL),
(69, 'domoina.razafindrabe57@lms.local', '$2b$12$P1mO8TGSpQssREWSxRv6B.GhUai0mBUIX2Vc6P8T5BUEBVzqQK9Nq', 'Domoina', 'Razafindrabe', NULL, NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:20:10.694', '2026-10-09 18:20:10.694', NULL),
(70, 'nyaina.rakotomalala58@lms.local', '$2b$12$/fKfNzvi8HA0MoQfSXTRy.ieC6rXcvQKfxfkvI81M4207xVhQarx6', 'Ny Aina', 'Rakotomalala', '+261 34 00 000 00058', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:20:11.467', '2026-10-09 18:20:11.467', NULL),
(71, 'tsiry.randriamihaja59@lms.local', '$2b$12$JT6EFB5r4Zr0JR3VE3wpCOzFJ9eB6fA2.pkE9JmrvQhWXGldoSFeq', 'Tsiry', 'Randriamihaja', '+261 34 00 000 00059', NULL, 'STUDENT', 'ACTIVE', 19, NULL, '2026-10-09 18:20:12.262', '2026-10-09 18:20:12.262', NULL),
(72, 'masoandro.razanakoto60@lms.local', '$2b$12$OkK0JhCRVwmvYiOagY5wnOIXCve8T8HRKKgm8Jm08/OM1QVIfkr6C', 'Masoandro', 'Razanakoto', '', NULL, 'STUDENT', 'ACTIVE', 19, '2026-10-17 06:50:01.596', '2026-10-09 18:20:13.035', '2026-10-17 06:50:01.602', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('1d2090d6-8f90-4968-8f8f-ab8e24c2fc1a', '133ab848bfafab86d2bb720a2d21df0dae84506c86742064bfca5e6397964b47', '2026-09-18 08:58:56.984', '20260918085849_add_courses', NULL, NULL, '2026-09-18 08:58:49.939', 1),
('22d8ee98-227d-441c-bd41-930cfcfb4188', 'ff066a9f5f522f9f24a475cfdc399c9f6f2205eb7551cf6d879d48d5f8f7f163', '2026-09-24 07:04:05.701', '20260924070404_add_matricule', NULL, NULL, '2026-09-24 07:04:05.038', 1),
('41946526-d9b9-473b-831b-ca6a77cd90e4', 'e1cf1862acdd257cd09ec092e87f8f6d0d73896610455beb9534d0625223502f', '2026-09-24 18:55:37.218', '20260924185527_add_assignments', NULL, NULL, '2026-09-24 18:55:28.030', 1),
('581c906a-10a8-44bc-95fc-5fc1463baa0e', 'c96188ccd32a194b7c4cf4b6b577c6ee5605ae380bb4cdabe6ebb01633f99e3e', '2026-09-19 20:35:37.007', '20260919203531_add_materials_and_notifications', NULL, NULL, '2026-09-19 20:35:31.331', 1),
('5bf44a5f-dc0a-431a-b929-10c338a7e8fa', '6ee69b1461cef456d848ff7f2f9b64f859d8aaa36360e42e917b86654c09621f', '2026-09-17 19:01:36.934', '20260917190132_init', NULL, NULL, '2026-09-17 19:01:32.408', 1),
('63f3152b-700d-4178-9c6d-27b8214e56b2', 'f9bbecc4a27ab91e69fa87665928d6c7e1dfe70edb286edc2e32387c43861808', '2026-09-19 11:52:30.919', '20260919115229_add_course_class', NULL, NULL, '2026-09-19 11:52:29.505', 1),
('7ca43f60-7613-445e-ab5b-14b95c7fcc4a', '40c49c62eb7ecac296445e1b4ebaa42e2d67ed74a121f1010788fca328415e90', '2026-09-21 08:07:07.541', '20260921080644_add_student_enrollment_and_finance', NULL, NULL, '2026-09-21 08:06:44.168', 1),
('a1487b89-e1d5-4ae0-94b8-1f9d50eaecf7', '1aff30221618cf8409d5ffa6c9226fa83eff490e064abbdb977a7dc5cc2ea863', '2026-09-19 06:57:37.217', '20260919065736_add_institution_type', NULL, NULL, '2026-09-19 06:57:36.515', 1),
('a1b0c7b5-4c2f-4764-afd4-7a78d564cbe8', '932c026fe8c5257f41418c3bc7b912c867c0f27cdb5539edbe51d99366a6622e', '2026-09-24 08:08:54.523', '20260924080853_add_academic_months_config', NULL, NULL, '2026-09-24 08:08:53.664', 1),
('a87b0dc2-9810-4abe-9873-f9dd489d54e7', 'e04626ab4a85162a069194f6c841f19d097d8014de732bef2185b2db916bbc36', '2026-09-26 02:44:22.123', '20260926024407_add_quiz_and_ai_detection', NULL, NULL, '2026-09-26 02:44:07.164', 1),
('add5e91e-4de9-4740-85a2-fba04c799159', 'e801b8776acaa31b8bef1686b32ce112e1fc42d10219c49bbd7ab396fffefa81', '2026-09-19 18:31:33.079', '20260919183124_add_teaching_units', NULL, NULL, '2026-09-19 18:31:24.808', 1),
('bcf401f0-dfbf-4fff-a9de-ed142d18ffe5', '2f399da278bc4d9334696c86ea874ea08927f604b30b4bccdc30d40bcbaf226d', '2026-09-23 18:11:41.419', '20260923181136_add_academic_years', NULL, NULL, '2026-09-23 18:11:36.456', 1),
('cb163c3f-acd5-4f1b-b19d-a3006104aba6', 'c352685b8973ac0293eab1302fd787463ddbdc03a2238f4cffe765db796a03e3', '2026-09-20 18:07:21.662', '20260920180719_add_course_modules', NULL, NULL, '2026-09-20 18:07:19.186', 1),
('cb700a0d-552f-41cc-be69-b22753563505', '16752e91fc797f7cf81eb20ea3416b4468ec96976e6e67567ed5cc22a61996a8', '2026-11-10 18:03:17.631', '20261110180316_add_exam_module', NULL, NULL, '2026-11-10 18:03:16.914', 1),
('e22931f3-993c-4ca5-8d75-8fce3eb99635', '99f4622371735a1337456eb752802123dcb63c2ee093056abe716316bf057782', '2026-09-20 19:05:21.333', '20260920190518_add_course_announcements', NULL, NULL, '2026-09-20 19:05:18.356', 1),
('f48fbb7d-afdc-452f-a0f5-6ad0de1e99b4', '5d3852295220f9842eb12ef22c379a9c494f59005219094015f697b04f5963b2', '2026-09-17 22:22:46.710', '20260917222243_add_calendar_events', NULL, NULL, '2026-09-17 22:22:43.661', 1);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `academic_years`
--
ALTER TABLE `academic_years`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `academic_years_label_key` (`label`),
  ADD KEY `academic_years_status_idx` (`status`),
  ADD KEY `academic_years_label_idx` (`label`),
  ADD KEY `academic_years_created_by_id_fkey` (`created_by_id`);

--
-- Index pour la table `assignments`
--
ALTER TABLE `assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `assignments_course_id_idx` (`course_id`),
  ADD KEY `assignments_status_idx` (`status`),
  ADD KEY `assignments_due_date_idx` (`due_date`),
  ADD KEY `assignments_created_by_id_fkey` (`created_by_id`);

--
-- Index pour la table `assignment_submissions`
--
ALTER TABLE `assignment_submissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `assignment_submissions_assignment_id_student_id_key` (`assignment_id`,`student_id`),
  ADD KEY `assignment_submissions_assignment_id_idx` (`assignment_id`),
  ADD KEY `assignment_submissions_student_id_idx` (`student_id`),
  ADD KEY `assignment_submissions_status_idx` (`status`),
  ADD KEY `assignment_submissions_graded_by_id_fkey` (`graded_by_id`);

--
-- Index pour la table `calendar_events`
--
ALTER TABLE `calendar_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `calendar_events_start_date_idx` (`start_date`),
  ADD KEY `calendar_events_unit_id_idx` (`unit_id`),
  ADD KEY `calendar_events_created_by_id_idx` (`created_by_id`);

--
-- Index pour la table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `courses_code_key` (`code`),
  ADD KEY `courses_unit_id_idx` (`unit_id`),
  ADD KEY `courses_status_idx` (`status`),
  ADD KEY `courses_code_idx` (`code`),
  ADD KEY `courses_created_by_id_fkey` (`created_by_id`),
  ADD KEY `courses_teaching_unit_id_idx` (`teaching_unit_id`);

--
-- Index pour la table `course_announcements`
--
ALTER TABLE `course_announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_announcements_course_id_idx` (`course_id`),
  ADD KEY `course_announcements_is_pinned_idx` (`is_pinned`),
  ADD KEY `course_announcements_expires_at_idx` (`expires_at`),
  ADD KEY `course_announcements_author_id_fkey` (`author_id`);

--
-- Index pour la table `course_classes`
--
ALTER TABLE `course_classes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `course_classes_course_id_class_id_key` (`course_id`,`class_id`),
  ADD KEY `course_classes_course_id_idx` (`course_id`),
  ADD KEY `course_classes_class_id_idx` (`class_id`);

--
-- Index pour la table `course_lessons`
--
ALTER TABLE `course_lessons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_lessons_module_id_idx` (`module_id`),
  ADD KEY `course_lessons_order_index_idx` (`order_index`);

--
-- Index pour la table `course_materials`
--
ALTER TABLE `course_materials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_materials_course_id_idx` (`course_id`),
  ADD KEY `course_materials_uploaded_by_id_idx` (`uploaded_by_id`),
  ADD KEY `course_materials_expires_at_idx` (`expires_at`),
  ADD KEY `course_materials_expiration_status_idx` (`expiration_status`);

--
-- Index pour la table `course_modules`
--
ALTER TABLE `course_modules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_modules_course_id_idx` (`course_id`),
  ADD KEY `course_modules_order_index_idx` (`order_index`);

--
-- Index pour la table `course_sessions`
--
ALTER TABLE `course_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `course_sessions_code_key` (`code`),
  ADD KEY `course_sessions_course_id_idx` (`course_id`),
  ADD KEY `course_sessions_academic_year_idx` (`academic_year`);

--
-- Index pour la table `course_teachers`
--
ALTER TABLE `course_teachers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `course_teachers_course_id_teacher_id_key` (`course_id`,`teacher_id`),
  ADD KEY `course_teachers_course_id_idx` (`course_id`),
  ADD KEY `course_teachers_teacher_id_idx` (`teacher_id`);

--
-- Index pour la table `discounts`
--
ALTER TABLE `discounts`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `enrollments_session_id_student_id_key` (`session_id`,`student_id`),
  ADD KEY `enrollments_session_id_idx` (`session_id`),
  ADD KEY `enrollments_student_id_idx` (`student_id`);

--
-- Index pour la table `exams`
--
ALTER TABLE `exams`
  ADD PRIMARY KEY (`id`),
  ADD KEY `exams_course_id_fkey` (`course_id`),
  ADD KEY `exams_created_by_id_fkey` (`created_by_id`);

--
-- Index pour la table `exam_attempts`
--
ALTER TABLE `exam_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `exam_attempts_exam_id_fkey` (`exam_id`),
  ADD KEY `exam_attempts_student_id_fkey` (`student_id`);

--
-- Index pour la table `exam_questions`
--
ALTER TABLE `exam_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `exam_questions_exam_id_fkey` (`exam_id`);

--
-- Index pour la table `fees`
--
ALTER TABLE `fees`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fees_class_id_idx` (`class_id`),
  ADD KEY `fees_level_id_idx` (`level_id`),
  ADD KEY `fees_academic_year_idx` (`academic_year`),
  ADD KEY `fees_fee_type_id_fkey` (`fee_type_id`);

--
-- Index pour la table `fee_types`
--
ALTER TABLE `fee_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `fee_types_code_key` (`code`);

--
-- Index pour la table `institution_units`
--
ALTER TABLE `institution_units`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `institution_units_code_key` (`code`),
  ADD KEY `institution_units_parent_id_idx` (`parent_id`),
  ADD KEY `institution_units_type_idx` (`type`);

--
-- Index pour la table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoices_reference_key` (`reference`),
  ADD KEY `invoices_student_id_idx` (`student_id`),
  ADD KEY `invoices_status_idx` (`status`),
  ADD KEY `invoices_due_date_idx` (`due_date`),
  ADD KEY `invoices_enrollment_id_idx` (`enrollment_id`),
  ADD KEY `invoices_fee_id_fkey` (`fee_id`),
  ADD KEY `invoices_academic_year_id_fkey` (`academic_year_id`);

--
-- Index pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_user_id_idx` (`user_id`),
  ADD KEY `notifications_status_idx` (`status`),
  ADD KEY `notifications_type_idx` (`type`),
  ADD KEY `notifications_created_at_idx` (`created_at`),
  ADD KEY `notifications_material_id_fkey` (`material_id`);

--
-- Index pour la table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payments_reference_key` (`reference`),
  ADD KEY `payments_invoice_id_idx` (`invoice_id`),
  ADD KEY `payments_student_id_idx` (`student_id`),
  ADD KEY `payments_status_idx` (`status`),
  ADD KEY `payments_method_idx` (`method`),
  ADD KEY `payments_created_by_id_fkey` (`created_by_id`);

--
-- Index pour la table `payment_reminders`
--
ALTER TABLE `payment_reminders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payment_reminders_invoice_id_idx` (`invoice_id`),
  ADD KEY `payment_reminders_status_idx` (`status`);

--
-- Index pour la table `payment_schedules`
--
ALTER TABLE `payment_schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payment_schedules_academic_year_idx` (`academic_year`);

--
-- Index pour la table `platform_settings`
--
ALTER TABLE `platform_settings`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `quizzes`
--
ALTER TABLE `quizzes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quizzes_course_id_idx` (`course_id`),
  ADD KEY `quizzes_created_by_id_fkey` (`created_by_id`);

--
-- Index pour la table `quiz_answers`
--
ALTER TABLE `quiz_answers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `quiz_answers_attempt_id_question_id_key` (`attempt_id`,`question_id`),
  ADD KEY `quiz_answers_question_id_fkey` (`question_id`);

--
-- Index pour la table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quiz_attempts_quiz_id_idx` (`quiz_id`),
  ADD KEY `quiz_attempts_student_id_idx` (`student_id`);

--
-- Index pour la table `quiz_questions`
--
ALTER TABLE `quiz_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quiz_questions_quiz_id_idx` (`quiz_id`);

--
-- Index pour la table `receipts`
--
ALTER TABLE `receipts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `receipts_reference_key` (`reference`),
  ADD UNIQUE KEY `receipts_payment_id_key` (`payment_id`);

--
-- Index pour la table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `refresh_tokens_token_key` (`token`),
  ADD KEY `refresh_tokens_user_id_idx` (`user_id`);

--
-- Index pour la table `student_discounts`
--
ALTER TABLE `student_discounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_discounts_student_id_discount_id_academic_year_key` (`student_id`,`discount_id`,`academic_year`),
  ADD KEY `student_discounts_student_id_idx` (`student_id`),
  ADD KEY `student_discounts_discount_id_fkey` (`discount_id`),
  ADD KEY `student_discounts_approved_by_id_fkey` (`approved_by_id`);

--
-- Index pour la table `student_enrollments`
--
ALTER TABLE `student_enrollments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_enrollments_reference_key` (`reference`),
  ADD KEY `student_enrollments_status_idx` (`status`),
  ADD KEY `student_enrollments_academic_year_idx` (`academic_year`),
  ADD KEY `student_enrollments_student_id_idx` (`student_id`),
  ADD KEY `student_enrollments_reference_idx` (`reference`),
  ADD KEY `student_enrollments_reviewed_by_id_fkey` (`reviewed_by_id`),
  ADD KEY `student_enrollments_final_decision_by_id_fkey` (`final_decision_by_id`),
  ADD KEY `student_enrollments_desired_class_id_fkey` (`desired_class_id`),
  ADD KEY `student_enrollments_desired_program_id_fkey` (`desired_program_id`),
  ADD KEY `student_enrollments_previous_enrollment_id_fkey` (`previous_enrollment_id`),
  ADD KEY `student_enrollments_academic_year_id_fkey` (`academic_year_id`);

--
-- Index pour la table `teaching_units`
--
ALTER TABLE `teaching_units`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `teaching_units_code_key` (`code`),
  ADD KEY `teaching_units_unit_id_idx` (`unit_id`),
  ADD KEY `teaching_units_semester_idx` (`semester`),
  ADD KEY `teaching_units_created_by_id_fkey` (`created_by_id`);

--
-- Index pour la table `teaching_unit_classes`
--
ALTER TABLE `teaching_unit_classes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `teaching_unit_classes_teaching_unit_id_class_id_key` (`teaching_unit_id`,`class_id`),
  ADD KEY `teaching_unit_classes_teaching_unit_id_idx` (`teaching_unit_id`),
  ADD KEY `teaching_unit_classes_class_id_idx` (`class_id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_key` (`email`),
  ADD UNIQUE KEY `users_matricule_key` (`matricule`),
  ADD KEY `users_email_idx` (`email`),
  ADD KEY `users_role_idx` (`role`),
  ADD KEY `users_unit_id_idx` (`unit_id`),
  ADD KEY `users_matricule_idx` (`matricule`);

--
-- Index pour la table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `academic_years`
--
ALTER TABLE `academic_years`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `assignments`
--
ALTER TABLE `assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `assignment_submissions`
--
ALTER TABLE `assignment_submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `calendar_events`
--
ALTER TABLE `calendar_events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT pour la table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT pour la table `course_announcements`
--
ALTER TABLE `course_announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `course_classes`
--
ALTER TABLE `course_classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `course_lessons`
--
ALTER TABLE `course_lessons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `course_materials`
--
ALTER TABLE `course_materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT pour la table `course_modules`
--
ALTER TABLE `course_modules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `course_sessions`
--
ALTER TABLE `course_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `course_teachers`
--
ALTER TABLE `course_teachers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pour la table `discounts`
--
ALTER TABLE `discounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `enrollments`
--
ALTER TABLE `enrollments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `exams`
--
ALTER TABLE `exams`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `exam_attempts`
--
ALTER TABLE `exam_attempts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `exam_questions`
--
ALTER TABLE `exam_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `fees`
--
ALTER TABLE `fees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `fee_types`
--
ALTER TABLE `fee_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `institution_units`
--
ALTER TABLE `institution_units`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT pour la table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=569;

--
-- AUTO_INCREMENT pour la table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=239;

--
-- AUTO_INCREMENT pour la table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `payment_reminders`
--
ALTER TABLE `payment_reminders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `payment_schedules`
--
ALTER TABLE `payment_schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `platform_settings`
--
ALTER TABLE `platform_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `quizzes`
--
ALTER TABLE `quizzes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT pour la table `quiz_answers`
--
ALTER TABLE `quiz_answers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT pour la table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `quiz_questions`
--
ALTER TABLE `quiz_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

--
-- AUTO_INCREMENT pour la table `receipts`
--
ALTER TABLE `receipts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=251;

--
-- AUTO_INCREMENT pour la table `student_discounts`
--
ALTER TABLE `student_discounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `student_enrollments`
--
ALTER TABLE `student_enrollments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT pour la table `teaching_units`
--
ALTER TABLE `teaching_units`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `teaching_unit_classes`
--
ALTER TABLE `teaching_unit_classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `academic_years`
--
ALTER TABLE `academic_years`
  ADD CONSTRAINT `academic_years_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `assignments`
--
ALTER TABLE `assignments`
  ADD CONSTRAINT `assignments_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `assignments_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `assignment_submissions`
--
ALTER TABLE `assignment_submissions`
  ADD CONSTRAINT `assignment_submissions_assignment_id_fkey` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `assignment_submissions_graded_by_id_fkey` FOREIGN KEY (`graded_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `assignment_submissions_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `calendar_events`
--
ALTER TABLE `calendar_events`
  ADD CONSTRAINT `calendar_events_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `calendar_events_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `institution_units` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `courses_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `courses_teaching_unit_id_fkey` FOREIGN KEY (`teaching_unit_id`) REFERENCES `teaching_units` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `courses_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `institution_units` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `course_announcements`
--
ALTER TABLE `course_announcements`
  ADD CONSTRAINT `course_announcements_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `course_announcements_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `course_classes`
--
ALTER TABLE `course_classes`
  ADD CONSTRAINT `course_classes_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `institution_units` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `course_classes_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `course_lessons`
--
ALTER TABLE `course_lessons`
  ADD CONSTRAINT `course_lessons_module_id_fkey` FOREIGN KEY (`module_id`) REFERENCES `course_modules` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `course_materials`
--
ALTER TABLE `course_materials`
  ADD CONSTRAINT `course_materials_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `course_materials_uploaded_by_id_fkey` FOREIGN KEY (`uploaded_by_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `course_modules`
--
ALTER TABLE `course_modules`
  ADD CONSTRAINT `course_modules_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `course_sessions`
--
ALTER TABLE `course_sessions`
  ADD CONSTRAINT `course_sessions_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `course_teachers`
--
ALTER TABLE `course_teachers`
  ADD CONSTRAINT `course_teachers_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `course_teachers_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `enrollments`
--
ALTER TABLE `enrollments`
  ADD CONSTRAINT `enrollments_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `course_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `enrollments_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `exams`
--
ALTER TABLE `exams`
  ADD CONSTRAINT `exams_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `exams_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Contraintes pour la table `exam_attempts`
--
ALTER TABLE `exam_attempts`
  ADD CONSTRAINT `exam_attempts_exam_id_fkey` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `exam_attempts_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `exam_questions`
--
ALTER TABLE `exam_questions`
  ADD CONSTRAINT `exam_questions_exam_id_fkey` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `fees`
--
ALTER TABLE `fees`
  ADD CONSTRAINT `fees_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `institution_units` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fees_fee_type_id_fkey` FOREIGN KEY (`fee_type_id`) REFERENCES `fee_types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fees_level_id_fkey` FOREIGN KEY (`level_id`) REFERENCES `institution_units` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `institution_units`
--
ALTER TABLE `institution_units`
  ADD CONSTRAINT `institution_units_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `institution_units` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_academic_year_id_fkey` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `invoices_enrollment_id_fkey` FOREIGN KEY (`enrollment_id`) REFERENCES `student_enrollments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `invoices_fee_id_fkey` FOREIGN KEY (`fee_id`) REFERENCES `fees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `invoices_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_material_id_fkey` FOREIGN KEY (`material_id`) REFERENCES `course_materials` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `payments_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `payments_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `payment_reminders`
--
ALTER TABLE `payment_reminders`
  ADD CONSTRAINT `payment_reminders_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `quizzes`
--
ALTER TABLE `quizzes`
  ADD CONSTRAINT `quizzes_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `quizzes_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Contraintes pour la table `quiz_answers`
--
ALTER TABLE `quiz_answers`
  ADD CONSTRAINT `quiz_answers_attempt_id_fkey` FOREIGN KEY (`attempt_id`) REFERENCES `quiz_attempts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `quiz_answers_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  ADD CONSTRAINT `quiz_attempts_quiz_id_fkey` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `quiz_attempts_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `quiz_questions`
--
ALTER TABLE `quiz_questions`
  ADD CONSTRAINT `quiz_questions_quiz_id_fkey` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `receipts`
--
ALTER TABLE `receipts`
  ADD CONSTRAINT `receipts_payment_id_fkey` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `refresh_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `student_discounts`
--
ALTER TABLE `student_discounts`
  ADD CONSTRAINT `student_discounts_approved_by_id_fkey` FOREIGN KEY (`approved_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `student_discounts_discount_id_fkey` FOREIGN KEY (`discount_id`) REFERENCES `discounts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `student_discounts_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `student_enrollments`
--
ALTER TABLE `student_enrollments`
  ADD CONSTRAINT `student_enrollments_academic_year_id_fkey` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `student_enrollments_desired_class_id_fkey` FOREIGN KEY (`desired_class_id`) REFERENCES `institution_units` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `student_enrollments_desired_program_id_fkey` FOREIGN KEY (`desired_program_id`) REFERENCES `institution_units` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `student_enrollments_final_decision_by_id_fkey` FOREIGN KEY (`final_decision_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `student_enrollments_previous_enrollment_id_fkey` FOREIGN KEY (`previous_enrollment_id`) REFERENCES `student_enrollments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `student_enrollments_reviewed_by_id_fkey` FOREIGN KEY (`reviewed_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `student_enrollments_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `teaching_units`
--
ALTER TABLE `teaching_units`
  ADD CONSTRAINT `teaching_units_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `teaching_units_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `institution_units` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `teaching_unit_classes`
--
ALTER TABLE `teaching_unit_classes`
  ADD CONSTRAINT `teaching_unit_classes_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `institution_units` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `teaching_unit_classes_teaching_unit_id_fkey` FOREIGN KEY (`teaching_unit_id`) REFERENCES `teaching_units` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `institution_units` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
