CREATE TABLE `flashcard_decks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(256) NOT NULL,
	`description` text,
	`programId` varchar(16),
	`pathId` varchar(64),
	`cardCount` int NOT NULL DEFAULT 0,
	`color` varchar(16) NOT NULL DEFAULT 'teal',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `flashcard_decks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `flashcards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`deckId` int NOT NULL,
	`front` text NOT NULL,
	`back` text NOT NULL,
	`hint` text,
	`easeFactor` int NOT NULL DEFAULT 250,
	`interval_days` int NOT NULL DEFAULT 0,
	`repetitions` int NOT NULL DEFAULT 0,
	`nextReviewDate` varchar(10),
	`lastReviewDate` varchar(10),
	`status` enum('new','learning','review','mastered') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `flashcards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `study_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`content` text NOT NULL,
	`tags` json,
	`programId` varchar(16),
	`pathId` varchar(64),
	`lessonId` varchar(16),
	`isPinned` boolean NOT NULL DEFAULT false,
	`color` varchar(16) NOT NULL DEFAULT 'default',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `study_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `study_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text,
	`sessionType` enum('lesson','quiz','sle_practice','flashcard_review','tutoring','custom') NOT NULL DEFAULT 'custom',
	`scheduledDate` varchar(10) NOT NULL,
	`scheduledTime` varchar(5),
	`durationMinutes` int NOT NULL DEFAULT 30,
	`isCompleted` boolean NOT NULL DEFAULT false,
	`programId` varchar(16),
	`pathId` varchar(64),
	`lessonId` varchar(16),
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `study_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vocabulary_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`word` varchar(256) NOT NULL,
	`translation` varchar(256) NOT NULL,
	`definition` text,
	`exampleSentence` text,
	`pronunciation` varchar(256),
	`partOfSpeech` varchar(32),
	`programId` varchar(16),
	`pathId` varchar(64),
	`lessonId` varchar(16),
	`mastery` enum('new','learning','familiar','mastered') NOT NULL DEFAULT 'new',
	`reviewCount` int NOT NULL DEFAULT 0,
	`correctCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vocabulary_items_id` PRIMARY KEY(`id`)
);
