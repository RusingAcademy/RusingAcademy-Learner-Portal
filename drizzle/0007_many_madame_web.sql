CREATE TABLE `coach_applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fullName` varchar(200) NOT NULL,
	`email` varchar(300) NOT NULL,
	`phone` varchar(50),
	`experience` text,
	`qualifications` text,
	`motivation` text,
	`status` enum('pending','approved','rejected','withdrawn') NOT NULL DEFAULT 'pending',
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`reviewNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coach_applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coach_payouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`coachId` int NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'CAD',
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`sessionsCount` int DEFAULT 0,
	`commissionRate` int DEFAULT 0,
	`processedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coach_payouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coach_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`displayName` varchar(200) NOT NULL,
	`bio` text,
	`specializations` text,
	`languages` text,
	`certifications` text,
	`hourlyRate` int DEFAULT 0,
	`status` enum('pending','active','suspended','inactive') NOT NULL DEFAULT 'pending',
	`averageRating` int DEFAULT 0,
	`totalSessions` int DEFAULT 0,
	`totalStudents` int DEFAULT 0,
	`suspendedAt` timestamp,
	`suspendedReason` text,
	`activatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coach_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `commission_tiers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`commissionRate` int NOT NULL,
	`minStudents` int DEFAULT 0,
	`maxStudents` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `commission_tiers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `content_calendar` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentItemId` int,
	`title` varchar(500) NOT NULL,
	`scheduledDate` timestamp NOT NULL,
	`contentType` enum('lesson','quiz','article','video','podcast','exercise') NOT NULL DEFAULT 'lesson',
	`status` enum('scheduled','published','cancelled') NOT NULL DEFAULT 'scheduled',
	`assignedTo` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `content_calendar_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `content_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`titleFr` varchar(500),
	`contentType` enum('lesson','quiz','article','video','podcast','exercise') NOT NULL DEFAULT 'lesson',
	`status` enum('draft','review','approved','published','archived') NOT NULL DEFAULT 'draft',
	`authorId` int,
	`reviewerId` int,
	`qualityScore` int,
	`scheduledPublishAt` timestamp,
	`publishedAt` timestamp,
	`body` text,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `content_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `content_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`nameFr` varchar(200),
	`category` enum('sle_prep','grammar','vocabulary','reading','listening','speaking','writing') NOT NULL DEFAULT 'sle_prep',
	`description` text,
	`structure` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`usageCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `content_templates_id` PRIMARY KEY(`id`)
);
