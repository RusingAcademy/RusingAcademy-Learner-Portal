CREATE TABLE `admin_team_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamId` int NOT NULL,
	`adminId` int NOT NULL,
	`role` enum('member','lead','coordinator') DEFAULT 'member',
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_team_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_teams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`department` varchar(100),
	`teamLeadId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_teams_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_teams_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `badge_criteria_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`templateType` enum('performance_focused','consistency_focused','quality_focused','balanced','custom') DEFAULT 'balanced',
	`criteriaConfig` json NOT NULL,
	`isPublic` boolean DEFAULT false,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `badge_criteria_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `custom_badge_criteria` (
	`id` int AUTO_INCREMENT NOT NULL,
	`badgeId` int NOT NULL,
	`criteriaType` enum('average_review_time','approval_rate','rejection_rate','total_reviewed','consistency_score','quality_score','custom_formula') NOT NULL,
	`minValue` decimal(10,2),
	`maxValue` decimal(10,2),
	`targetValue` decimal(10,2),
	`customFormula` text,
	`isActive` boolean DEFAULT true,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `custom_badge_criteria_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leaderboard_archives` (
	`id` int AUTO_INCREMENT NOT NULL,
	`season` varchar(50) NOT NULL,
	`seasonType` enum('monthly','quarterly','yearly') DEFAULT 'monthly',
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`leaderboardSnapshot` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`isActive` boolean DEFAULT false,
	CONSTRAINT `leaderboard_archives_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `team_performance_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamId` int NOT NULL,
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`totalApplicationsReviewed` int DEFAULT 0,
	`totalApproved` int DEFAULT 0,
	`totalRejected` int DEFAULT 0,
	`averageReviewTimeHours` decimal(8,2) DEFAULT '0',
	`teamApprovalRate` int DEFAULT 0,
	`teamRejectionRate` int DEFAULT 0,
	`activeMembers` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `team_performance_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `admin_team_members` ADD CONSTRAINT `admin_team_members_teamId_admin_teams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `admin_teams`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin_team_members` ADD CONSTRAINT `admin_team_members_adminId_users_id_fk` FOREIGN KEY (`adminId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin_teams` ADD CONSTRAINT `admin_teams_teamLeadId_users_id_fk` FOREIGN KEY (`teamLeadId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `badge_criteria_templates` ADD CONSTRAINT `badge_criteria_templates_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `custom_badge_criteria` ADD CONSTRAINT `custom_badge_criteria_badgeId_admin_badges_id_fk` FOREIGN KEY (`badgeId`) REFERENCES `admin_badges`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `custom_badge_criteria` ADD CONSTRAINT `custom_badge_criteria_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team_performance_metrics` ADD CONSTRAINT `team_performance_metrics_teamId_admin_teams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `admin_teams`(`id`) ON DELETE cascade ON UPDATE no action;