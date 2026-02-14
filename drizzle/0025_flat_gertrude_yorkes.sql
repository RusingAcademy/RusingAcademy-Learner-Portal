CREATE TABLE `achievement_milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`badgeId` int NOT NULL,
	`currentValue` decimal(10,2) DEFAULT '0',
	`targetValue` int NOT NULL,
	`progressPercentage` int DEFAULT 0,
	`isCompleted` boolean DEFAULT false,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `achievement_milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`badgeId` int NOT NULL,
	`achievedAt` timestamp NOT NULL DEFAULT (now()),
	`value` int,
	`notificationSent` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`icon` varchar(50),
	`color` varchar(7) DEFAULT '#0ea5a5',
	`criteria` enum('speed_demon','fair_judge','volume_champion','consistency_master','quality_expert','efficiency_leader','team_player','milestone_100','milestone_500','milestone_1000') NOT NULL,
	`threshold` int,
	`thresholdUnit` varchar(50),
	`isActive` boolean DEFAULT true,
	`tier` enum('bronze','silver','gold','platinum') DEFAULT 'bronze',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_badges_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_badges_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `comment_mentions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`commentId` int NOT NULL,
	`mentionedUserId` int NOT NULL,
	`notificationSent` boolean DEFAULT false,
	`notificationSentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `comment_mentions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comment_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`createdBy` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`content` text NOT NULL,
	`category` enum('feedback','approval','rejection','clarification') DEFAULT 'feedback',
	`isPublic` boolean DEFAULT false,
	`isArchived` boolean DEFAULT false,
	`usageCount` int DEFAULT 0,
	`lastUsedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comment_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `achievement_milestones` ADD CONSTRAINT `achievement_milestones_adminId_users_id_fk` FOREIGN KEY (`adminId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `achievement_milestones` ADD CONSTRAINT `achievement_milestones_badgeId_admin_badges_id_fk` FOREIGN KEY (`badgeId`) REFERENCES `admin_badges`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin_achievements` ADD CONSTRAINT `admin_achievements_adminId_users_id_fk` FOREIGN KEY (`adminId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin_achievements` ADD CONSTRAINT `admin_achievements_badgeId_admin_badges_id_fk` FOREIGN KEY (`badgeId`) REFERENCES `admin_badges`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comment_mentions` ADD CONSTRAINT `comment_mentions_commentId_application_comments_id_fk` FOREIGN KEY (`commentId`) REFERENCES `application_comments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comment_mentions` ADD CONSTRAINT `comment_mentions_mentionedUserId_users_id_fk` FOREIGN KEY (`mentionedUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comment_templates` ADD CONSTRAINT `comment_templates_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;