CREATE TABLE `coach_gallery_photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`coachId` int NOT NULL,
	`photoUrl` text NOT NULL,
	`thumbnailUrl` text,
	`caption` varchar(200),
	`altText` varchar(200),
	`photoType` enum('profile','workspace','certificate','session','event','other') DEFAULT 'other',
	`sortOrder` int DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coach_gallery_photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `push_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`endpoint` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	`userAgent` text,
	`deviceName` varchar(100),
	`enableBookings` boolean DEFAULT true,
	`enableMessages` boolean DEFAULT true,
	`enableReminders` boolean DEFAULT true,
	`enableMarketing` boolean DEFAULT false,
	`isActive` boolean DEFAULT true,
	`lastUsedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `push_subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`coachId` int NOT NULL,
	`notes` text NOT NULL,
	`topicsCovered` json,
	`areasForImprovement` json,
	`homework` text,
	`oralLevel` enum('X','A','B','C'),
	`writtenLevel` enum('X','A','B','C'),
	`readingLevel` enum('X','A','B','C'),
	`sharedWithLearner` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `session_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `coach_gallery_photos` ADD CONSTRAINT `coach_gallery_photos_coachId_coach_profiles_id_fk` FOREIGN KEY (`coachId`) REFERENCES `coach_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `push_subscriptions` ADD CONSTRAINT `push_subscriptions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_notes` ADD CONSTRAINT `session_notes_sessionId_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session_notes` ADD CONSTRAINT `session_notes_coachId_coach_profiles_id_fk` FOREIGN KEY (`coachId`) REFERENCES `coach_profiles`(`id`) ON DELETE no action ON UPDATE no action;