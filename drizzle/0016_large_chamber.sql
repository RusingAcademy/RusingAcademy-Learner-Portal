CREATE TABLE `loyalty_points` (
	`id` int AUTO_INCREMENT NOT NULL,
	`learnerId` int NOT NULL,
	`totalPoints` int NOT NULL DEFAULT 0,
	`availablePoints` int NOT NULL DEFAULT 0,
	`lifetimePoints` int NOT NULL DEFAULT 0,
	`tier` enum('bronze','silver','gold','platinum') NOT NULL DEFAULT 'bronze',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `loyalty_points_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `loyalty_rewards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`nameEn` varchar(100) NOT NULL,
	`nameFr` varchar(100) NOT NULL,
	`description` text,
	`descriptionEn` text,
	`descriptionFr` text,
	`pointsCost` int NOT NULL,
	`rewardType` enum('discount_5','discount_10','discount_15','discount_20','free_trial','free_session','priority_booking','exclusive_coach') NOT NULL,
	`isActive` boolean DEFAULT true,
	`minTier` enum('bronze','silver','gold','platinum') DEFAULT 'bronze',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `loyalty_rewards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `point_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`learnerId` int NOT NULL,
	`type` enum('earned_booking','earned_review','earned_referral','earned_streak','earned_milestone','redeemed_discount','redeemed_session','expired','adjustment') NOT NULL,
	`points` int NOT NULL,
	`description` text,
	`referenceType` varchar(50),
	`referenceId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `point_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `redeemed_rewards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`learnerId` int NOT NULL,
	`rewardId` int NOT NULL,
	`pointsSpent` int NOT NULL,
	`status` enum('active','used','expired') NOT NULL DEFAULT 'active',
	`discountCode` varchar(50),
	`expiresAt` timestamp,
	`usedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `redeemed_rewards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `loyalty_points` ADD CONSTRAINT `loyalty_points_learnerId_learner_profiles_id_fk` FOREIGN KEY (`learnerId`) REFERENCES `learner_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `point_transactions` ADD CONSTRAINT `point_transactions_learnerId_learner_profiles_id_fk` FOREIGN KEY (`learnerId`) REFERENCES `learner_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `redeemed_rewards` ADD CONSTRAINT `redeemed_rewards_learnerId_learner_profiles_id_fk` FOREIGN KEY (`learnerId`) REFERENCES `learner_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `redeemed_rewards` ADD CONSTRAINT `redeemed_rewards_rewardId_loyalty_rewards_id_fk` FOREIGN KEY (`rewardId`) REFERENCES `loyalty_rewards`(`id`) ON DELETE no action ON UPDATE no action;