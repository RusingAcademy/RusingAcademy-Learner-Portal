CREATE TABLE `coach_badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`coachId` int NOT NULL,
	`badgeType` enum('els_verified','top_rated','rising_star','sessions_50','sessions_100','sessions_500','perfect_attendance','quick_responder','student_favorite','exam_success') NOT NULL,
	`awardedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`isActive` boolean DEFAULT true,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coach_badges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learner_favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`learnerId` int NOT NULL,
	`coachId` int NOT NULL,
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learner_favorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `coach_badges` ADD CONSTRAINT `coach_badges_coachId_coach_profiles_id_fk` FOREIGN KEY (`coachId`) REFERENCES `coach_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `learner_favorites` ADD CONSTRAINT `learner_favorites_learnerId_learner_profiles_id_fk` FOREIGN KEY (`learnerId`) REFERENCES `learner_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `learner_favorites` ADD CONSTRAINT `learner_favorites_coachId_coach_profiles_id_fk` FOREIGN KEY (`coachId`) REFERENCES `coach_profiles`(`id`) ON DELETE no action ON UPDATE no action;