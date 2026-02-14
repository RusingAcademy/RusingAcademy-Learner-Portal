CREATE TABLE `certificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('path_completion','level_achievement','challenge_winner') NOT NULL DEFAULT 'path_completion',
	`title` varchar(512) NOT NULL,
	`titleFr` varchar(512),
	`description` text,
	`descriptionFr` text,
	`pathId` varchar(64),
	`cefrLevel` enum('A1','A2','B1','B2','C1'),
	`issuedAt` timestamp NOT NULL DEFAULT (now()),
	`certificateUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `certificates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `grammar_drills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`topic` varchar(256) NOT NULL,
	`cefrLevel` enum('A1','A2','B1','B2','C1') NOT NULL,
	`drillType` enum('fill_blank','conjugation','reorder','multiple_choice') NOT NULL DEFAULT 'fill_blank',
	`score` int,
	`totalQuestions` int NOT NULL DEFAULT 10,
	`correctAnswers` int NOT NULL DEFAULT 0,
	`timeSpentSeconds` int,
	`language` enum('en','fr') NOT NULL DEFAULT 'fr',
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `grammar_drills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `listening_exercises` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`exerciseTitle` varchar(512) NOT NULL,
	`cefrLevel` enum('A1','A2','B1','B2','C1') NOT NULL,
	`score` int,
	`totalQuestions` int NOT NULL DEFAULT 5,
	`correctAnswers` int NOT NULL DEFAULT 0,
	`timeSpentSeconds` int,
	`language` enum('en','fr') NOT NULL DEFAULT 'fr',
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `listening_exercises_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `peer_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`submissionId` int NOT NULL,
	`reviewerId` int NOT NULL,
	`authorId` int NOT NULL,
	`grammarScore` int,
	`vocabularyScore` int,
	`coherenceScore` int,
	`overallScore` int,
	`feedback` text,
	`strengths` text,
	`improvements` text,
	`status` enum('pending','completed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `peer_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reading_exercises` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`passageTitle` varchar(512) NOT NULL,
	`cefrLevel` enum('A1','A2','B1','B2','C1') NOT NULL,
	`wordsPerMinute` int,
	`score` int,
	`totalQuestions` int NOT NULL DEFAULT 5,
	`correctAnswers` int NOT NULL DEFAULT 0,
	`timeSpentSeconds` int,
	`language` enum('en','fr') NOT NULL DEFAULT 'fr',
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reading_exercises_id` PRIMARY KEY(`id`)
);
