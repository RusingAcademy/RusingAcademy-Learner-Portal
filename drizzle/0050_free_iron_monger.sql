CREATE TABLE `learning_paths` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(100) NOT NULL,
	`title` varchar(200) NOT NULL,
	`titleFr` varchar(200),
	`subtitle` varchar(300),
	`subtitleFr` varchar(300),
	`description` text,
	`descriptionFr` text,
	`cefrLevel` enum('A1','A2','B1','B2','C1','C2','exam_prep') NOT NULL,
	`levelBadge` varchar(50),
	`sleBadge` varchar(20),
	`pfl2Level` varchar(20),
	`durationWeeks` int DEFAULT 4,
	`structuredHours` int DEFAULT 30,
	`autonomousPracticeMin` int DEFAULT 80,
	`autonomousPracticeMax` int DEFAULT 130,
	`price` int NOT NULL,
	`originalPrice` int,
	`currency` varchar(3) DEFAULT 'CAD',
	`thumbnailUrl` text,
	`previewVideoUrl` text,
	`icon` varchar(10),
	`colorGradient` varchar(100),
	`bgColor` varchar(50),
	`borderColor` varchar(50),
	`targetAudience` text,
	`targetAudienceFr` text,
	`learningOutcomes` json,
	`totalCourses` int DEFAULT 0,
	`totalModules` int DEFAULT 0,
	`totalLessons` int DEFAULT 0,
	`totalEnrollments` int DEFAULT 0,
	`averageRating` decimal(3,2),
	`totalReviews` int DEFAULT 0,
	`completionRate` int DEFAULT 0,
	`sortOrder` int DEFAULT 0,
	`status` enum('draft','published','archived') DEFAULT 'draft',
	`publishedAt` timestamp,
	`hasCertificate` boolean DEFAULT true,
	`hasQuizzes` boolean DEFAULT true,
	`hasCoachingSupport` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `learning_paths_id` PRIMARY KEY(`id`),
	CONSTRAINT `learning_paths_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `path_courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pathId` int NOT NULL,
	`courseId` int NOT NULL,
	`sortOrder` int DEFAULT 0,
	`isRequired` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `path_courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `path_enrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pathId` int NOT NULL,
	`userId` int NOT NULL,
	`progressPercent` int DEFAULT 0,
	`coursesCompleted` int DEFAULT 0,
	`lastAccessedAt` timestamp,
	`status` enum('active','completed','paused','expired') DEFAULT 'active',
	`completedAt` timestamp,
	`stripePaymentIntentId` varchar(100),
	`paidAmount` int,
	`accessExpiresAt` timestamp,
	`certificateId` int,
	`certificateIssuedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `path_enrollments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `path_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pathId` int NOT NULL,
	`userId` int NOT NULL,
	`enrollmentId` int,
	`rating` int NOT NULL,
	`title` varchar(200),
	`content` text,
	`helpfulCount` int DEFAULT 0,
	`status` enum('pending','approved','rejected') DEFAULT 'pending',
	`approvedAt` timestamp,
	`approvedBy` int,
	`isVerifiedPurchase` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `path_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `path_courses` ADD CONSTRAINT `path_courses_pathId_learning_paths_id_fk` FOREIGN KEY (`pathId`) REFERENCES `learning_paths`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `path_courses` ADD CONSTRAINT `path_courses_courseId_courses_id_fk` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `path_enrollments` ADD CONSTRAINT `path_enrollments_pathId_learning_paths_id_fk` FOREIGN KEY (`pathId`) REFERENCES `learning_paths`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `path_enrollments` ADD CONSTRAINT `path_enrollments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `path_enrollments` ADD CONSTRAINT `path_enrollments_certificateId_certificates_id_fk` FOREIGN KEY (`certificateId`) REFERENCES `certificates`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `path_reviews` ADD CONSTRAINT `path_reviews_pathId_learning_paths_id_fk` FOREIGN KEY (`pathId`) REFERENCES `learning_paths`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `path_reviews` ADD CONSTRAINT `path_reviews_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `path_reviews` ADD CONSTRAINT `path_reviews_enrollmentId_path_enrollments_id_fk` FOREIGN KEY (`enrollmentId`) REFERENCES `path_enrollments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `path_reviews` ADD CONSTRAINT `path_reviews_approvedBy_users_id_fk` FOREIGN KEY (`approvedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;