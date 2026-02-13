CREATE TABLE `daily_study_goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`xpTarget` int NOT NULL DEFAULT 50,
	`xpEarned` int NOT NULL DEFAULT 0,
	`lessonsTarget` int NOT NULL DEFAULT 1,
	`lessonsCompleted` int NOT NULL DEFAULT 0,
	`studyMinutesTarget` int NOT NULL DEFAULT 30,
	`studyMinutesActual` int NOT NULL DEFAULT 0,
	`isGoalMet` boolean NOT NULL DEFAULT false,
	`streakMultiplier` int NOT NULL DEFAULT 100,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `daily_study_goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `discussion_replies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`threadId` int NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`parentReplyId` int,
	`likeCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `discussion_replies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `discussion_threads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(512) NOT NULL,
	`content` text NOT NULL,
	`category` enum('grammar','vocabulary','sle_prep','general','study_tips','resources') NOT NULL DEFAULT 'general',
	`isPinned` boolean NOT NULL DEFAULT false,
	`isLocked` boolean NOT NULL DEFAULT false,
	`replyCount` int NOT NULL DEFAULT 0,
	`likeCount` int NOT NULL DEFAULT 0,
	`viewCount` int NOT NULL DEFAULT 0,
	`lastReplyAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `discussion_threads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `writing_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(512) NOT NULL,
	`content` text NOT NULL,
	`promptText` text,
	`language` enum('en','fr') NOT NULL DEFAULT 'fr',
	`cefrLevel` enum('A1','A2','B1','B2','C1'),
	`status` enum('draft','submitted','reviewed') NOT NULL DEFAULT 'draft',
	`wordCount` int NOT NULL DEFAULT 0,
	`aiFeedback` text,
	`aiScore` int,
	`programId` varchar(16),
	`pathId` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `writing_submissions_id` PRIMARY KEY(`id`)
);
