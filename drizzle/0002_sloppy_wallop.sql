CREATE TABLE `celebration_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`eventType` enum('level_up','badge_earned','challenge_completed','streak_milestone','path_completed','perfect_quiz','first_lesson') NOT NULL,
	`metadata` json,
	`seen` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `celebration_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `challenge_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`challengeId` int NOT NULL,
	`currentValue` int NOT NULL DEFAULT 0,
	`isCompleted` boolean NOT NULL DEFAULT false,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `challenge_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weekly_challenges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`titleFr` varchar(256) NOT NULL,
	`description` text NOT NULL,
	`descriptionFr` text NOT NULL,
	`challengeType` enum('complete_lessons','earn_xp','perfect_quizzes','maintain_streak','complete_slots','study_time') NOT NULL,
	`targetValue` int NOT NULL,
	`xpReward` int NOT NULL DEFAULT 200,
	`badgeReward` varchar(64),
	`weekStartDate` varchar(10) NOT NULL,
	`weekEndDate` varchar(10) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weekly_challenges_id` PRIMARY KEY(`id`)
);
