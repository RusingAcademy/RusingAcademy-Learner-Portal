CREATE TABLE `bookmarks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`itemType` enum('lesson','note','vocabulary','discussion','flashcard_deck') NOT NULL,
	`itemId` int NOT NULL,
	`itemTitle` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bookmarks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coach_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`coachId` int NOT NULL,
	`studentId` int NOT NULL,
	`status` enum('active','paused','completed') NOT NULL DEFAULT 'active',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coach_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dictation_exercises` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`cefrLevel` enum('A1','A2','B1','B2','C1') NOT NULL DEFAULT 'B1',
	`totalSentences` int NOT NULL,
	`correctSentences` int,
	`accuracy` int,
	`timeSpentSeconds` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dictation_exercises_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mock_sle_exams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`examType` enum('reading','writing','oral') NOT NULL,
	`cefrLevel` enum('A1','A2','B1','B2','C1') NOT NULL DEFAULT 'B1',
	`totalQuestions` int NOT NULL,
	`correctAnswers` int,
	`score` int,
	`timeLimitSeconds` int NOT NULL,
	`timeUsedSeconds` int,
	`status` enum('in_progress','completed','expired') NOT NULL DEFAULT 'in_progress',
	`answers` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `mock_sle_exams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `onboarding_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`currentLevel` enum('A1','A2','B1','B2','C1') NOT NULL DEFAULT 'A1',
	`targetLevel` enum('A1','A2','B1','B2','C1') NOT NULL DEFAULT 'B2',
	`learningGoal` enum('sle_prep','conversation','professional','academic','travel') NOT NULL DEFAULT 'sle_prep',
	`weeklyHours` int NOT NULL DEFAULT 5,
	`preferredTime` enum('morning','afternoon','evening') NOT NULL DEFAULT 'morning',
	`completedOnboarding` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `onboarding_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `study_group_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`groupId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('member','admin') NOT NULL DEFAULT 'member',
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `study_group_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `study_groups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`creatorId` int NOT NULL,
	`maxMembers` int NOT NULL DEFAULT 10,
	`cefrLevel` enum('A1','A2','B1','B2','C1') NOT NULL DEFAULT 'B1',
	`isPublic` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `study_groups_id` PRIMARY KEY(`id`)
);
