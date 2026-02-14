CREATE TABLE `ai_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`learnerId` int NOT NULL,
	`sessionType` enum('practice','placement','simulation') NOT NULL,
	`language` enum('french','english') NOT NULL,
	`targetLevel` enum('a','b','c'),
	`transcript` json,
	`score` int,
	`assessedLevel` enum('a','b','c'),
	`feedback` json,
	`duration` int,
	`status` enum('in_progress','completed','abandoned') DEFAULT 'in_progress',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `ai_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coach_applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`coachProfileId` int,
	`fullName` varchar(200) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20),
	`yearsTeaching` int,
	`sleExperience` text,
	`credentials` text,
	`certificateUrls` json,
	`introVideoUrl` text,
	`whyLingueefy` text,
	`status` enum('submitted','under_review','approved','rejected') DEFAULT 'submitted',
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`reviewNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coach_applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coach_availability` (
	`id` int AUTO_INCREMENT NOT NULL,
	`coachId` int NOT NULL,
	`dayOfWeek` int NOT NULL,
	`startTime` varchar(5) NOT NULL,
	`endTime` varchar(5) NOT NULL,
	`timezone` varchar(50) DEFAULT 'America/Toronto',
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coach_availability_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coach_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`slug` varchar(100) NOT NULL,
	`headline` varchar(200),
	`bio` text,
	`videoUrl` text,
	`languages` enum('french','english','both') DEFAULT 'both',
	`specializations` json,
	`yearsExperience` int,
	`credentials` text,
	`hourlyRate` int,
	`trialRate` int,
	`totalSessions` int DEFAULT 0,
	`totalStudents` int DEFAULT 0,
	`averageRating` decimal(3,2),
	`successRate` int,
	`responseTimeHours` int DEFAULT 24,
	`status` enum('pending','approved','suspended','rejected') DEFAULT 'pending',
	`approvedAt` timestamp,
	`approvedBy` int,
	`rejectionReason` text,
	`stripeAccountId` varchar(100),
	`stripeOnboarded` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coach_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `coach_profiles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`participant1Id` int NOT NULL,
	`participant2Id` int NOT NULL,
	`lastMessageAt` timestamp,
	`lastMessagePreview` varchar(200),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`learnerId` int NOT NULL,
	`coachId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learner_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`department` varchar(200),
	`position` varchar(200),
	`currentLevel` json,
	`targetLevel` json,
	`examDate` timestamp,
	`learningGoals` text,
	`primaryFocus` enum('oral','written','reading','all') DEFAULT 'oral',
	`targetLanguage` enum('french','english') DEFAULT 'french',
	`totalSessions` int DEFAULT 0,
	`totalAiSessions` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `learner_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`senderId` int NOT NULL,
	`content` text NOT NULL,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `packages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`learnerId` int NOT NULL,
	`coachId` int NOT NULL,
	`sessionsTotal` int NOT NULL,
	`sessionsUsed` int DEFAULT 0,
	`priceTotal` int NOT NULL,
	`pricePerSession` int NOT NULL,
	`status` enum('active','completed','expired','refunded') DEFAULT 'active',
	`expiresAt` timestamp,
	`stripePaymentIntentId` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `packages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`learnerId` int NOT NULL,
	`coachId` int NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`sleAchievement` varchar(50),
	`coachResponse` text,
	`coachRespondedAt` timestamp,
	`isVisible` boolean DEFAULT true,
	`flaggedAt` timestamp,
	`flagReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`coachId` int NOT NULL,
	`learnerId` int NOT NULL,
	`packageId` int,
	`scheduledAt` timestamp NOT NULL,
	`duration` int NOT NULL DEFAULT 60,
	`timezone` varchar(50) DEFAULT 'America/Toronto',
	`sessionType` enum('trial','single','package') DEFAULT 'single',
	`focusArea` enum('oral_a','oral_b','oral_c','written','reading','general') DEFAULT 'general',
	`learnerNotes` text,
	`status` enum('pending','confirmed','in_progress','completed','cancelled','no_show') DEFAULT 'pending',
	`cancelledBy` enum('learner','coach','admin'),
	`cancellationReason` text,
	`price` int NOT NULL,
	`meetingUrl` text,
	`coachNotes` text,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','coach','learner') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `preferredLanguage` enum('en','fr') DEFAULT 'en';--> statement-breakpoint
ALTER TABLE `ai_sessions` ADD CONSTRAINT `ai_sessions_learnerId_learner_profiles_id_fk` FOREIGN KEY (`learnerId`) REFERENCES `learner_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coach_applications` ADD CONSTRAINT `coach_applications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coach_applications` ADD CONSTRAINT `coach_applications_coachProfileId_coach_profiles_id_fk` FOREIGN KEY (`coachProfileId`) REFERENCES `coach_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coach_applications` ADD CONSTRAINT `coach_applications_reviewedBy_users_id_fk` FOREIGN KEY (`reviewedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coach_availability` ADD CONSTRAINT `coach_availability_coachId_coach_profiles_id_fk` FOREIGN KEY (`coachId`) REFERENCES `coach_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coach_profiles` ADD CONSTRAINT `coach_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_participant1Id_users_id_fk` FOREIGN KEY (`participant1Id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_participant2Id_users_id_fk` FOREIGN KEY (`participant2Id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_learnerId_learner_profiles_id_fk` FOREIGN KEY (`learnerId`) REFERENCES `learner_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_coachId_coach_profiles_id_fk` FOREIGN KEY (`coachId`) REFERENCES `coach_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `learner_profiles` ADD CONSTRAINT `learner_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_conversationId_conversations_id_fk` FOREIGN KEY (`conversationId`) REFERENCES `conversations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_senderId_users_id_fk` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `packages` ADD CONSTRAINT `packages_learnerId_learner_profiles_id_fk` FOREIGN KEY (`learnerId`) REFERENCES `learner_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `packages` ADD CONSTRAINT `packages_coachId_coach_profiles_id_fk` FOREIGN KEY (`coachId`) REFERENCES `coach_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_sessionId_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_learnerId_learner_profiles_id_fk` FOREIGN KEY (`learnerId`) REFERENCES `learner_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_coachId_coach_profiles_id_fk` FOREIGN KEY (`coachId`) REFERENCES `coach_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_coachId_coach_profiles_id_fk` FOREIGN KEY (`coachId`) REFERENCES `coach_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_learnerId_learner_profiles_id_fk` FOREIGN KEY (`learnerId`) REFERENCES `learner_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_packageId_packages_id_fk` FOREIGN KEY (`packageId`) REFERENCES `packages`(`id`) ON DELETE no action ON UPDATE no action;