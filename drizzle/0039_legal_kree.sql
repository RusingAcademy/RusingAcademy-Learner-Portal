CREATE TABLE `bundle_courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bundleId` int NOT NULL,
	`courseId` int NOT NULL,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bundle_courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `certificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`certificateId` varchar(50) NOT NULL,
	`userId` int NOT NULL,
	`courseId` int NOT NULL,
	`enrollmentId` int NOT NULL,
	`recipientName` varchar(200) NOT NULL,
	`courseName` varchar(200) NOT NULL,
	`completionDate` timestamp NOT NULL,
	`verificationUrl` text,
	`pdfUrl` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `certificates_id` PRIMARY KEY(`id`),
	CONSTRAINT `certificates_certificateId_unique` UNIQUE(`certificateId`)
);
--> statement-breakpoint
CREATE TABLE `course_bundles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`slug` varchar(200) NOT NULL,
	`description` text,
	`thumbnailUrl` text,
	`price` int NOT NULL,
	`originalPrice` int,
	`savingsPercent` int,
	`status` enum('draft','published','archived') DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `course_bundles_id` PRIMARY KEY(`id`),
	CONSTRAINT `course_bundles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `course_enrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`courseId` int NOT NULL,
	`enrolledAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`progressPercent` int DEFAULT 0,
	`lessonsCompleted` int DEFAULT 0,
	`totalLessons` int DEFAULT 0,
	`lastAccessedAt` timestamp,
	`completedAt` timestamp,
	`certificateId` varchar(50),
	`certificateIssuedAt` timestamp,
	`stripePaymentId` varchar(100),
	`amountPaid` int DEFAULT 0,
	`status` enum('active','completed','expired','refunded') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `course_enrollments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `course_modules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text,
	`sortOrder` int DEFAULT 0,
	`totalLessons` int DEFAULT 0,
	`totalDurationMinutes` int DEFAULT 0,
	`isPreview` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `course_modules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `course_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`courseId` int NOT NULL,
	`enrollmentId` int,
	`rating` int NOT NULL,
	`title` varchar(200),
	`comment` text,
	`helpfulVotes` int DEFAULT 0,
	`isVisible` boolean DEFAULT true,
	`isVerifiedPurchase` boolean DEFAULT true,
	`instructorResponse` text,
	`instructorRespondedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `course_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`slug` varchar(200) NOT NULL,
	`description` text,
	`shortDescription` varchar(500),
	`thumbnailUrl` text,
	`previewVideoUrl` text,
	`category` enum('sle_oral','sle_written','sle_reading','sle_complete','business_french','business_english','exam_prep','conversation','grammar','vocabulary') DEFAULT 'sle_oral',
	`level` enum('beginner','intermediate','advanced','all_levels') DEFAULT 'all_levels',
	`targetLanguage` enum('french','english','both') DEFAULT 'french',
	`price` int DEFAULT 0,
	`originalPrice` int,
	`currency` varchar(3) DEFAULT 'CAD',
	`accessType` enum('one_time','subscription','free') DEFAULT 'one_time',
	`accessDurationDays` int,
	`totalModules` int DEFAULT 0,
	`totalLessons` int DEFAULT 0,
	`totalDurationMinutes` int DEFAULT 0,
	`totalEnrollments` int DEFAULT 0,
	`averageRating` decimal(3,2),
	`totalReviews` int DEFAULT 0,
	`instructorId` int,
	`instructorName` varchar(100),
	`status` enum('draft','published','archived') DEFAULT 'draft',
	`publishedAt` timestamp,
	`metaTitle` varchar(60),
	`metaDescription` varchar(160),
	`hasCertificate` boolean DEFAULT true,
	`hasQuizzes` boolean DEFAULT true,
	`hasDownloads` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `courses_id` PRIMARY KEY(`id`),
	CONSTRAINT `courses_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `lesson_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`lessonId` int NOT NULL,
	`enrollmentId` int NOT NULL,
	`status` enum('not_started','in_progress','completed') DEFAULT 'not_started',
	`progressPercent` int DEFAULT 0,
	`videoWatchedSeconds` int DEFAULT 0,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`lastAccessedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lesson_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`moduleId` int NOT NULL,
	`courseId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text,
	`contentType` enum('video','text','audio','pdf','quiz','assignment','download','live_session') DEFAULT 'video',
	`videoUrl` text,
	`videoProvider` enum('youtube','vimeo','wistia','bunny','self_hosted'),
	`videoDurationSeconds` int,
	`videoThumbnailUrl` text,
	`textContent` text,
	`audioUrl` text,
	`audioDurationSeconds` int,
	`downloadUrl` text,
	`downloadFileName` varchar(200),
	`sortOrder` int DEFAULT 0,
	`estimatedMinutes` int DEFAULT 10,
	`isPreview` boolean DEFAULT false,
	`isMandatory` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lessons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`quizId` int NOT NULL,
	`enrollmentId` int,
	`attemptNumber` int DEFAULT 1,
	`score` int DEFAULT 0,
	`pointsEarned` int DEFAULT 0,
	`totalPoints` int DEFAULT 0,
	`passed` boolean DEFAULT false,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`timeSpentSeconds` int,
	`answers` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quiz_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quizId` int NOT NULL,
	`questionText` text NOT NULL,
	`questionType` enum('multiple_choice','true_false','fill_blank','matching','short_answer','audio_response') DEFAULT 'multiple_choice',
	`imageUrl` text,
	`audioUrl` text,
	`options` json,
	`correctAnswer` text,
	`explanation` text,
	`points` int DEFAULT 1,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quiz_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quizzes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lessonId` int,
	`courseId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text,
	`passingScore` int DEFAULT 70,
	`timeLimit` int,
	`attemptsAllowed` int DEFAULT 3,
	`shuffleQuestions` boolean DEFAULT true,
	`showCorrectAnswers` boolean DEFAULT true,
	`totalQuestions` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quizzes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `bundle_courses` ADD CONSTRAINT `bundle_courses_bundleId_course_bundles_id_fk` FOREIGN KEY (`bundleId`) REFERENCES `course_bundles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bundle_courses` ADD CONSTRAINT `bundle_courses_courseId_courses_id_fk` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `certificates` ADD CONSTRAINT `certificates_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `certificates` ADD CONSTRAINT `certificates_courseId_courses_id_fk` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `certificates` ADD CONSTRAINT `certificates_enrollmentId_course_enrollments_id_fk` FOREIGN KEY (`enrollmentId`) REFERENCES `course_enrollments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_enrollments` ADD CONSTRAINT `course_enrollments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_enrollments` ADD CONSTRAINT `course_enrollments_courseId_courses_id_fk` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_modules` ADD CONSTRAINT `course_modules_courseId_courses_id_fk` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_reviews` ADD CONSTRAINT `course_reviews_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_reviews` ADD CONSTRAINT `course_reviews_courseId_courses_id_fk` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_reviews` ADD CONSTRAINT `course_reviews_enrollmentId_course_enrollments_id_fk` FOREIGN KEY (`enrollmentId`) REFERENCES `course_enrollments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `courses` ADD CONSTRAINT `courses_instructorId_users_id_fk` FOREIGN KEY (`instructorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lesson_progress` ADD CONSTRAINT `lesson_progress_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lesson_progress` ADD CONSTRAINT `lesson_progress_lessonId_lessons_id_fk` FOREIGN KEY (`lessonId`) REFERENCES `lessons`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lesson_progress` ADD CONSTRAINT `lesson_progress_enrollmentId_course_enrollments_id_fk` FOREIGN KEY (`enrollmentId`) REFERENCES `course_enrollments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lessons` ADD CONSTRAINT `lessons_moduleId_course_modules_id_fk` FOREIGN KEY (`moduleId`) REFERENCES `course_modules`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lessons` ADD CONSTRAINT `lessons_courseId_courses_id_fk` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quiz_attempts` ADD CONSTRAINT `quiz_attempts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quiz_attempts` ADD CONSTRAINT `quiz_attempts_quizId_quizzes_id_fk` FOREIGN KEY (`quizId`) REFERENCES `quizzes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quiz_attempts` ADD CONSTRAINT `quiz_attempts_enrollmentId_course_enrollments_id_fk` FOREIGN KEY (`enrollmentId`) REFERENCES `course_enrollments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quiz_questions` ADD CONSTRAINT `quiz_questions_quizId_quizzes_id_fk` FOREIGN KEY (`quizId`) REFERENCES `quizzes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quizzes` ADD CONSTRAINT `quizzes_lessonId_lessons_id_fk` FOREIGN KEY (`lessonId`) REFERENCES `lessons`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quizzes` ADD CONSTRAINT `quizzes_courseId_courses_id_fk` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;