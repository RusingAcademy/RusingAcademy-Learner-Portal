CREATE TABLE `challenges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`nameFr` varchar(100),
	`description` text,
	`descriptionFr` text,
	`type` enum('sessions','reviews','referrals','streak','first_session') NOT NULL,
	`targetCount` int NOT NULL,
	`pointsReward` int NOT NULL,
	`period` enum('daily','weekly','monthly','one_time') NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `challenges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `in_app_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('message','session','points','challenge','review','system') NOT NULL,
	`title` varchar(200) NOT NULL,
	`titleFr` varchar(200),
	`message` text NOT NULL,
	`messageFr` text,
	`linkType` enum('session','message','coach','learner','challenge','none'),
	`linkId` int,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `in_app_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_challenges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`challengeId` int NOT NULL,
	`currentProgress` int NOT NULL DEFAULT 0,
	`targetProgress` int NOT NULL,
	`status` enum('active','completed','expired') NOT NULL DEFAULT 'active',
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`completedAt` timestamp,
	`pointsAwarded` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_challenges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `in_app_notifications` ADD CONSTRAINT `in_app_notifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_challenges` ADD CONSTRAINT `user_challenges_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_challenges` ADD CONSTRAINT `user_challenges_challengeId_challenges_id_fk` FOREIGN KEY (`challengeId`) REFERENCES `challenges`(`id`) ON DELETE no action ON UPDATE no action;