CREATE TABLE `activity_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`activityType` enum('lesson_started','lesson_completed','slot_completed','quiz_completed','badge_earned','streak_milestone','path_enrolled','path_completed','login') NOT NULL,
	`programId` varchar(16),
	`pathId` varchar(64),
	`lessonId` varchar(16),
	`metadata` json,
	`xpEarned` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gamification_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalXp` int NOT NULL DEFAULT 0,
	`level` int NOT NULL DEFAULT 1,
	`currentStreak` int NOT NULL DEFAULT 0,
	`longestStreak` int NOT NULL DEFAULT 0,
	`lastActivityDate` varchar(10),
	`lessonsCompleted` int NOT NULL DEFAULT 0,
	`quizzesCompleted` int NOT NULL DEFAULT 0,
	`perfectQuizzes` int NOT NULL DEFAULT 0,
	`totalStudyTimeMinutes` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gamification_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lesson_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`programId` varchar(16) NOT NULL,
	`pathId` varchar(64) NOT NULL,
	`moduleIndex` int NOT NULL,
	`lessonId` varchar(16) NOT NULL,
	`slotsCompleted` json,
	`isCompleted` boolean NOT NULL DEFAULT false,
	`xpEarned` int NOT NULL DEFAULT 0,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lesson_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`message` text NOT NULL,
	`type` enum('info','achievement','reminder','system') NOT NULL DEFAULT 'info',
	`isRead` boolean NOT NULL DEFAULT false,
	`link` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `path_enrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`programId` varchar(16) NOT NULL,
	`pathId` varchar(64) NOT NULL,
	`status` enum('enrolled','in_progress','completed') NOT NULL DEFAULT 'enrolled',
	`progressPercent` int NOT NULL DEFAULT 0,
	`enrolledAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `path_enrollments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`programId` varchar(16) NOT NULL,
	`pathId` varchar(64) NOT NULL,
	`lessonId` varchar(16),
	`quizType` enum('formative','summative','final_exam') NOT NULL,
	`totalQuestions` int NOT NULL,
	`correctAnswers` int NOT NULL,
	`score` int NOT NULL,
	`answers` json,
	`xpEarned` int NOT NULL DEFAULT 0,
	`isPerfect` boolean NOT NULL DEFAULT false,
	`attemptNumber` int NOT NULL DEFAULT 1,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quiz_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`badgeId` varchar(64) NOT NULL,
	`badgeName` varchar(128) NOT NULL,
	`badgeDescription` text,
	`badgeIcon` varchar(32) NOT NULL,
	`badgeColor` varchar(16) NOT NULL,
	`xpReward` int NOT NULL DEFAULT 0,
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_badges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `preferredLanguage` enum('en','fr') DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;