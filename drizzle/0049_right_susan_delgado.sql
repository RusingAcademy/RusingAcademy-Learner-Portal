CREATE TABLE `sle_practice_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`questionId` int NOT NULL,
	`sessionType` enum('practice','simulation','assessment') DEFAULT 'practice',
	`userAnswer` text,
	`isCorrect` boolean,
	`score` int,
	`timeSpent` int,
	`aiFeedback` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sle_practice_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sle_practice_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`examType` enum('reading','writing','oral') NOT NULL,
	`level` enum('A','B','C') NOT NULL,
	`language` enum('french','english') DEFAULT 'french',
	`questionText` text NOT NULL,
	`questionTextFr` text,
	`passageText` text,
	`passageTextFr` text,
	`writingPrompt` text,
	`writingPromptFr` text,
	`oralPrompt` text,
	`oralPromptFr` text,
	`audioUrl` text,
	`options` json,
	`correctAnswer` varchar(10),
	`sampleAnswer` text,
	`sampleAnswerFr` text,
	`rubric` json,
	`difficulty` int DEFAULT 1,
	`timeLimit` int DEFAULT 60,
	`points` int DEFAULT 1,
	`tags` json,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sle_practice_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `sle_practice_attempts` ADD CONSTRAINT `sle_practice_attempts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sle_practice_attempts` ADD CONSTRAINT `sle_practice_attempts_questionId_sle_practice_questions_id_fk` FOREIGN KEY (`questionId`) REFERENCES `sle_practice_questions`(`id`) ON DELETE no action ON UPDATE no action;