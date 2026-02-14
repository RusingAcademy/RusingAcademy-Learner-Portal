CREATE TABLE `activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lessonId` int NOT NULL,
	`moduleId` int NOT NULL,
	`courseId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text,
	`activityType` enum('video','text','audio','quiz','assignment','download','live_session','embed','speaking_exercise','fill_blank','matching','discussion') NOT NULL DEFAULT 'text',
	`content` text,
	`contentJson` json,
	`videoUrl` text,
	`videoProvider` enum('youtube','vimeo','bunny','self_hosted'),
	`audioUrl` text,
	`downloadUrl` text,
	`downloadFileName` varchar(200),
	`embedCode` text,
	`thumbnailUrl` text,
	`estimatedMinutes` int DEFAULT 5,
	`points` int DEFAULT 0,
	`passingScore` int,
	`sortOrder` int DEFAULT 0,
	`status` enum('draft','published','archived') DEFAULT 'draft',
	`isPreview` boolean DEFAULT false,
	`isMandatory` boolean DEFAULT true,
	`availableAt` timestamp,
	`unlockMode` enum('immediate','drip','prerequisite','manual') DEFAULT 'immediate',
	`prerequisiteActivityId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `activity_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`activityId` int NOT NULL,
	`userId` int NOT NULL,
	`lessonId` int NOT NULL,
	`courseId` int,
	`status` enum('not_started','in_progress','completed','failed') DEFAULT 'not_started',
	`score` int,
	`attempts` int DEFAULT 0,
	`timeSpentSeconds` int DEFAULT 0,
	`responseData` json,
	`completedAt` timestamp,
	`lastAccessedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `activity_progress_id` PRIMARY KEY(`id`),
	CONSTRAINT `activity_progress_user_activity_idx` UNIQUE(`userId`,`activityId`)
);
--> statement-breakpoint
CREATE TABLE `affiliate_partners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`email` varchar(320) NOT NULL,
	`referralCode` varchar(20) NOT NULL,
	`tier` enum('bronze','silver','gold','platinum') DEFAULT 'bronze',
	`commissionRate` decimal(4,2) DEFAULT '0.10',
	`totalReferrals` int DEFAULT 0,
	`totalEarnings` int DEFAULT 0,
	`pendingEarnings` int DEFAULT 0,
	`paidEarnings` int DEFAULT 0,
	`paymentMethod` enum('bank_transfer','paypal','stripe') DEFAULT 'bank_transfer',
	`paymentDetails` json,
	`status` enum('pending','active','suspended','terminated') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliate_partners_id` PRIMARY KEY(`id`),
	CONSTRAINT `affiliate_partners_referralCode_unique` UNIQUE(`referralCode`)
);
--> statement-breakpoint
CREATE TABLE `affiliate_payouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`amount` int NOT NULL,
	`status` enum('pending','processing','completed','failed') DEFAULT 'pending',
	`paymentMethod` enum('bank_transfer','paypal','stripe') DEFAULT 'bank_transfer',
	`transactionId` varchar(100),
	`notes` text,
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `affiliate_payouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `affiliate_referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`referredUserId` int NOT NULL,
	`source` varchar(100),
	`landingPage` varchar(500),
	`status` enum('pending','converted','expired','refunded') DEFAULT 'pending',
	`orderAmount` int,
	`commissionAmount` int,
	`productType` varchar(100),
	`convertedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `affiliate_referrals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `automations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`triggerType` enum('enrollment','purchase','course_complete','lesson_complete','signup','inactivity','tag_added','manual') NOT NULL,
	`triggerConfig` json DEFAULT ('{}'),
	`status` enum('active','paused','draft') NOT NULL DEFAULT 'draft',
	`steps` json DEFAULT ('[]'),
	`stats` json DEFAULT ('{"triggered":0,"completed":0,"active":0}'),
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `automations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coaching_plan_purchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`planId` varchar(100) NOT NULL,
	`planName` varchar(200) NOT NULL,
	`totalSessions` int NOT NULL,
	`remainingSessions` int NOT NULL,
	`validityDays` int NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`amountPaid` varchar(50) NOT NULL,
	`stripePaymentIntentId` varchar(100),
	`status` enum('active','expired','exhausted','refunded') DEFAULT 'active',
	`purchasedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coaching_plan_purchases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `funnels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`status` enum('draft','active','paused','archived') NOT NULL DEFAULT 'draft',
	`stages` json DEFAULT ('[]'),
	`stats` json DEFAULT ('{"visitors":0,"conversions":0,"revenue":0}'),
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `funnels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `onboarding_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stepKey` varchar(100) NOT NULL,
	`stepTitle` varchar(255) NOT NULL,
	`stepDescription` text,
	`actionType` enum('email','notification','course_assign','checklist','redirect') NOT NULL,
	`actionConfig` json DEFAULT ('{}'),
	`isEnabled` boolean DEFAULT true,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `onboarding_config_id` PRIMARY KEY(`id`),
	CONSTRAINT `onboarding_config_stepKey_unique` UNIQUE(`stepKey`)
);
--> statement-breakpoint
CREATE TABLE `onboarding_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stepKey` varchar(100) NOT NULL,
	`completed` boolean DEFAULT false,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `onboarding_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sle_companion_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`audioUrl` text,
	`transcriptionDuration` int,
	`score` int,
	`corrections` json,
	`suggestions` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sle_companion_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sle_companion_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`coachKey` enum('STEVEN','SUE_ANNE','ERIKA','PRECIOSA') NOT NULL,
	`level` enum('A','B','C') NOT NULL,
	`skill` enum('oral_expression','oral_comprehension','written_expression','written_comprehension') NOT NULL,
	`topic` varchar(255),
	`status` enum('active','completed','abandoned') NOT NULL DEFAULT 'active',
	`totalMessages` int DEFAULT 0,
	`totalDurationSeconds` int DEFAULT 0,
	`averageScore` int,
	`feedback` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	CONSTRAINT `sle_companion_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `lesson_progress` DROP FOREIGN KEY `lesson_progress_enrollmentId_course_enrollments_id_fk`;
--> statement-breakpoint
ALTER TABLE `path_enrollments` DROP FOREIGN KEY `path_enrollments_certificateId_certificates_id_fk`;
--> statement-breakpoint
ALTER TABLE `quiz_questions` DROP FOREIGN KEY `quiz_questions_quizId_quizzes_id_fk`;
--> statement-breakpoint
ALTER TABLE `learning_paths` MODIFY COLUMN `slug` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `learning_paths` MODIFY COLUMN `title` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `learning_paths` MODIFY COLUMN `titleFr` varchar(255);--> statement-breakpoint
ALTER TABLE `learning_paths` MODIFY COLUMN `subtitle` varchar(500);--> statement-breakpoint
ALTER TABLE `learning_paths` MODIFY COLUMN `subtitleFr` varchar(500);--> statement-breakpoint
ALTER TABLE `learning_paths` MODIFY COLUMN `cefrLevel` varchar(20);--> statement-breakpoint
ALTER TABLE `learning_paths` MODIFY COLUMN `durationWeeks` int;--> statement-breakpoint
ALTER TABLE `learning_paths` MODIFY COLUMN `structuredHours` int;--> statement-breakpoint
ALTER TABLE `learning_paths` MODIFY COLUMN `price` decimal(10,2) NOT NULL;--> statement-breakpoint
ALTER TABLE `learning_paths` MODIFY COLUMN `originalPrice` decimal(10,2);--> statement-breakpoint
ALTER TABLE `learning_paths` MODIFY COLUMN `totalModules` int;--> statement-breakpoint
ALTER TABLE `learning_paths` MODIFY COLUMN `totalLessons` int;--> statement-breakpoint
ALTER TABLE `learning_paths` MODIFY COLUMN `createdAt` timestamp DEFAULT (now());--> statement-breakpoint
ALTER TABLE `learning_paths` MODIFY COLUMN `updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `path_enrollments` MODIFY COLUMN `status` enum('active','completed','paused','cancelled') DEFAULT 'active';--> statement-breakpoint
ALTER TABLE `path_enrollments` MODIFY COLUMN `stripePaymentIntentId` varchar(255);--> statement-breakpoint
ALTER TABLE `quiz_questions` MODIFY COLUMN `points` int DEFAULT 10;--> statement-breakpoint
ALTER TABLE `coach_profiles` ADD `calendlyEventTypeUri` varchar(500);--> statement-breakpoint
ALTER TABLE `course_modules` ADD `thumbnailUrl` text;--> statement-breakpoint
ALTER TABLE `course_modules` ADD `availableAt` timestamp;--> statement-breakpoint
ALTER TABLE `course_modules` ADD `unlockMode` enum('immediate','drip','prerequisite','manual') DEFAULT 'immediate';--> statement-breakpoint
ALTER TABLE `course_modules` ADD `prerequisiteModuleId` int;--> statement-breakpoint
ALTER TABLE `course_modules` ADD `status` enum('draft','published','archived') DEFAULT 'published';--> statement-breakpoint
ALTER TABLE `courses` ADD `dripEnabled` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `courses` ADD `dripInterval` int DEFAULT 7;--> statement-breakpoint
ALTER TABLE `courses` ADD `dripUnit` enum('days','weeks','months') DEFAULT 'days';--> statement-breakpoint
ALTER TABLE `courses` ADD `totalActivities` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `learner_xp` ADD `streakFreezeCount` int DEFAULT 2 NOT NULL;--> statement-breakpoint
ALTER TABLE `learning_paths` ADD `level` enum('A1','A2','B1','B2','C1','exam_prep') NOT NULL;--> statement-breakpoint
ALTER TABLE `learning_paths` ADD `pflLevel` varchar(50);--> statement-breakpoint
ALTER TABLE `learning_paths` ADD `discountPercentage` int;--> statement-breakpoint
ALTER TABLE `learning_paths` ADD `practiceHoursMin` int;--> statement-breakpoint
ALTER TABLE `learning_paths` ADD `practiceHoursMax` int;--> statement-breakpoint
ALTER TABLE `learning_paths` ADD `objectives` json;--> statement-breakpoint
ALTER TABLE `learning_paths` ADD `outcomes` json;--> statement-breakpoint
ALTER TABLE `learning_paths` ADD `whoIsThisFor` json;--> statement-breakpoint
ALTER TABLE `learning_paths` ADD `whatYouWillLearn` json;--> statement-breakpoint
ALTER TABLE `learning_paths` ADD `modules` json;--> statement-breakpoint
ALTER TABLE `learning_paths` ADD `bannerUrl` text;--> statement-breakpoint
ALTER TABLE `learning_paths` ADD `isFeatured` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `learning_paths` ADD `displayOrder` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `learning_paths` ADD `enrollmentCount` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `learning_paths` ADD `reviewCount` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `lesson_progress` ADD `courseId` int;--> statement-breakpoint
ALTER TABLE `lesson_progress` ADD `moduleId` int;--> statement-breakpoint
ALTER TABLE `lesson_progress` ADD `timeSpentSeconds` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `lessons` ADD `thumbnailUrl` text;--> statement-breakpoint
ALTER TABLE `lessons` ADD `contentJson` json;--> statement-breakpoint
ALTER TABLE `lessons` ADD `status` enum('draft','published','archived') DEFAULT 'published';--> statement-breakpoint
ALTER TABLE `lessons` ADD `availableAt` timestamp;--> statement-breakpoint
ALTER TABLE `lessons` ADD `unlockMode` enum('immediate','drip','prerequisite','manual') DEFAULT 'immediate';--> statement-breakpoint
ALTER TABLE `lessons` ADD `prerequisiteLessonId` int;--> statement-breakpoint
ALTER TABLE `lessons` ADD `totalActivities` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `path_courses` ADD `orderIndex` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `path_enrollments` ADD `progressPercentage` decimal(5,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `path_enrollments` ADD `currentModuleIndex` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `path_enrollments` ADD `currentLessonIndex` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `path_enrollments` ADD `completedCourses` json;--> statement-breakpoint
ALTER TABLE `path_enrollments` ADD `paymentStatus` enum('pending','paid','refunded') DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `path_enrollments` ADD `amountPaid` decimal(10,2);--> statement-breakpoint
ALTER TABLE `path_enrollments` ADD `enrolledAt` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `path_enrollments` ADD `startedAt` timestamp;--> statement-breakpoint
ALTER TABLE `quiz_questions` ADD `lessonId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `quiz_questions` ADD `moduleId` int;--> statement-breakpoint
ALTER TABLE `quiz_questions` ADD `courseId` int;--> statement-breakpoint
ALTER TABLE `quiz_questions` ADD `questionTextFr` text;--> statement-breakpoint
ALTER TABLE `quiz_questions` ADD `explanationFr` text;--> statement-breakpoint
ALTER TABLE `quiz_questions` ADD `difficulty` enum('easy','medium','hard') DEFAULT 'medium';--> statement-breakpoint
ALTER TABLE `quiz_questions` ADD `orderIndex` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `quiz_questions` ADD `isActive` boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE `users` ADD `googleId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `microsoftId` varchar(255);--> statement-breakpoint
ALTER TABLE `lesson_progress` ADD CONSTRAINT `lesson_progress_user_lesson_idx` UNIQUE(`userId`,`lessonId`);--> statement-breakpoint
ALTER TABLE `activities` ADD CONSTRAINT `activities_lessonId_lessons_id_fk` FOREIGN KEY (`lessonId`) REFERENCES `lessons`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `activities` ADD CONSTRAINT `activities_moduleId_course_modules_id_fk` FOREIGN KEY (`moduleId`) REFERENCES `course_modules`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `activities` ADD CONSTRAINT `activities_courseId_courses_id_fk` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `activity_progress` ADD CONSTRAINT `activity_progress_activityId_activities_id_fk` FOREIGN KEY (`activityId`) REFERENCES `activities`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `activity_progress` ADD CONSTRAINT `activity_progress_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `activity_progress` ADD CONSTRAINT `activity_progress_lessonId_lessons_id_fk` FOREIGN KEY (`lessonId`) REFERENCES `lessons`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `activity_progress` ADD CONSTRAINT `activity_progress_courseId_courses_id_fk` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `affiliate_partners` ADD CONSTRAINT `affiliate_partners_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `affiliate_payouts` ADD CONSTRAINT `affiliate_payouts_affiliateId_affiliate_partners_id_fk` FOREIGN KEY (`affiliateId`) REFERENCES `affiliate_partners`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `affiliate_referrals` ADD CONSTRAINT `affiliate_referrals_affiliateId_affiliate_partners_id_fk` FOREIGN KEY (`affiliateId`) REFERENCES `affiliate_partners`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `affiliate_referrals` ADD CONSTRAINT `affiliate_referrals_referredUserId_users_id_fk` FOREIGN KEY (`referredUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `automations` ADD CONSTRAINT `automations_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coaching_plan_purchases` ADD CONSTRAINT `coaching_plan_purchases_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `funnels` ADD CONSTRAINT `funnels_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `onboarding_progress` ADD CONSTRAINT `onboarding_progress_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sle_companion_messages` ADD CONSTRAINT `sle_companion_messages_sessionId_sle_companion_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `sle_companion_sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sle_companion_sessions` ADD CONSTRAINT `sle_companion_sessions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lesson_progress` ADD CONSTRAINT `lesson_progress_courseId_courses_id_fk` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lesson_progress` ADD CONSTRAINT `lesson_progress_moduleId_course_modules_id_fk` FOREIGN KEY (`moduleId`) REFERENCES `course_modules`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `learning_paths` DROP COLUMN `levelBadge`;--> statement-breakpoint
ALTER TABLE `learning_paths` DROP COLUMN `sleBadge`;--> statement-breakpoint
ALTER TABLE `learning_paths` DROP COLUMN `pfl2Level`;--> statement-breakpoint
ALTER TABLE `learning_paths` DROP COLUMN `autonomousPracticeMin`;--> statement-breakpoint
ALTER TABLE `learning_paths` DROP COLUMN `autonomousPracticeMax`;--> statement-breakpoint
ALTER TABLE `learning_paths` DROP COLUMN `currency`;--> statement-breakpoint
ALTER TABLE `learning_paths` DROP COLUMN `previewVideoUrl`;--> statement-breakpoint
ALTER TABLE `learning_paths` DROP COLUMN `icon`;--> statement-breakpoint
ALTER TABLE `learning_paths` DROP COLUMN `colorGradient`;--> statement-breakpoint
ALTER TABLE `learning_paths` DROP COLUMN `bgColor`;--> statement-breakpoint
ALTER TABLE `learning_paths` DROP COLUMN `borderColor`;--> statement-breakpoint
ALTER TABLE `learning_paths` DROP COLUMN `targetAudience`;--> statement-breakpoint
ALTER TABLE `learning_paths` DROP COLUMN `targetAudienceFr`;--> statement-breakpoint
ALTER TABLE `learning_paths` DROP COLUMN `learningOutcomes`;--> statement-breakpoint
ALTER TABLE `learning_paths` DROP COLUMN `totalCourses`;--> statement-breakpoint
ALTER TABLE `learning_paths` DROP COLUMN `totalEnrollments`;--> statement-breakpoint
ALTER TABLE `learning_paths` DROP COLUMN `totalReviews`;--> statement-breakpoint
ALTER TABLE `learning_paths` DROP COLUMN `sortOrder`;--> statement-breakpoint
ALTER TABLE `learning_paths` DROP COLUMN `publishedAt`;--> statement-breakpoint
ALTER TABLE `learning_paths` DROP COLUMN `hasCertificate`;--> statement-breakpoint
ALTER TABLE `learning_paths` DROP COLUMN `hasQuizzes`;--> statement-breakpoint
ALTER TABLE `learning_paths` DROP COLUMN `hasCoachingSupport`;--> statement-breakpoint
ALTER TABLE `lesson_progress` DROP COLUMN `enrollmentId`;--> statement-breakpoint
ALTER TABLE `lesson_progress` DROP COLUMN `videoWatchedSeconds`;--> statement-breakpoint
ALTER TABLE `lesson_progress` DROP COLUMN `startedAt`;--> statement-breakpoint
ALTER TABLE `path_courses` DROP COLUMN `sortOrder`;--> statement-breakpoint
ALTER TABLE `path_enrollments` DROP COLUMN `progressPercent`;--> statement-breakpoint
ALTER TABLE `path_enrollments` DROP COLUMN `coursesCompleted`;--> statement-breakpoint
ALTER TABLE `path_enrollments` DROP COLUMN `lastAccessedAt`;--> statement-breakpoint
ALTER TABLE `path_enrollments` DROP COLUMN `paidAmount`;--> statement-breakpoint
ALTER TABLE `path_enrollments` DROP COLUMN `accessExpiresAt`;--> statement-breakpoint
ALTER TABLE `path_enrollments` DROP COLUMN `certificateId`;--> statement-breakpoint
ALTER TABLE `path_enrollments` DROP COLUMN `certificateIssuedAt`;--> statement-breakpoint
ALTER TABLE `path_enrollments` DROP COLUMN `createdAt`;--> statement-breakpoint
ALTER TABLE `quiz_questions` DROP COLUMN `quizId`;--> statement-breakpoint
ALTER TABLE `quiz_questions` DROP COLUMN `imageUrl`;--> statement-breakpoint
ALTER TABLE `quiz_questions` DROP COLUMN `audioUrl`;--> statement-breakpoint
ALTER TABLE `quiz_questions` DROP COLUMN `sortOrder`;--> statement-breakpoint
ALTER TABLE `quiz_questions` DROP COLUMN `updatedAt`;