CREATE TABLE `sle_error_taxonomy` (
	`id` int AUTO_INCREMENT NOT NULL,
	`errorId` varchar(20) NOT NULL,
	`language` enum('fr','en') NOT NULL,
	`category` enum('anglicism','syntax','conjugation','register','pronunciation','vocabulary','spelling','gender','preposition','false_friend') NOT NULL,
	`severityLevel` int NOT NULL,
	`pattern` text NOT NULL,
	`correction` text NOT NULL,
	`correctionRule` text NOT NULL,
	`feedbackTextFr` text,
	`feedbackTextEn` text,
	`levelImpact` enum('A','B','C','all') NOT NULL,
	`criterionAffected` enum('grammar','vocabulary','fluency','pronunciation','comprehension') NOT NULL,
	`examples` json,
	`resourceLink` varchar(500),
	`tags` json,
	`needsReview` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sle_error_taxonomy_id` PRIMARY KEY(`id`),
	CONSTRAINT `sle_error_taxonomy_errorId_unique` UNIQUE(`errorId`)
);
--> statement-breakpoint
CREATE TABLE `sle_evaluation_rubrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rubricId` varchar(36) NOT NULL,
	`criterionName` enum('grammar','vocabulary','fluency','pronunciation','comprehension') NOT NULL,
	`level` enum('A','B','C') NOT NULL,
	`maxPoints` int NOT NULL DEFAULT 20,
	`weightFactor` decimal(3,2) NOT NULL DEFAULT '1.00',
	`descriptorExcellent` text NOT NULL,
	`descriptorGood` text NOT NULL,
	`descriptorAdequate` text NOT NULL,
	`descriptorDeveloping` text NOT NULL,
	`descriptorInsufficient` text NOT NULL,
	`feedbackTemplates` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sle_evaluation_rubrics_id` PRIMARY KEY(`id`),
	CONSTRAINT `sle_evaluation_rubrics_rubricId_unique` UNIQUE(`rubricId`)
);
--> statement-breakpoint
CREATE TABLE `sle_interaction_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`logId` varchar(36) NOT NULL,
	`sessionId` varchar(36) NOT NULL,
	`turnSequence` int NOT NULL,
	`userInputTranscript` text,
	`aiResponse` text,
	`detectedErrors` json,
	`criterionScores` json,
	`turnScore` int,
	`latencyMs` int,
	`sttLatencyMs` int,
	`llmLatencyMs` int,
	`ttsLatencyMs` int,
	`rawScoringJson` json,
	`validatorResult` json,
	`ragChunkIds` json,
	`systemPromptHash` varchar(64),
	`temperature` decimal(3,2),
	`maxTokens` int,
	`audioUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sle_interaction_logs_id` PRIMARY KEY(`id`),
	CONSTRAINT `sle_interaction_logs_logId_unique` UNIQUE(`logId`)
);
--> statement-breakpoint
CREATE TABLE `sle_knowledge_collections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`collectionKey` varchar(50) NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`itemCount` int DEFAULT 0,
	`lastSyncedAt` timestamp,
	`version` varchar(20) DEFAULT '1.0.0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sle_knowledge_collections_id` PRIMARY KEY(`id`),
	CONSTRAINT `sle_knowledge_collections_collectionKey_unique` UNIQUE(`collectionKey`)
);
--> statement-breakpoint
CREATE TABLE `sle_model_answers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`answerId` varchar(36) NOT NULL,
	`scenarioId` varchar(36),
	`language` enum('fr','en') NOT NULL,
	`targetLevel` enum('B','C') NOT NULL,
	`questionRef` text,
	`answerText` text NOT NULL,
	`registerVariant` enum('formal','semi_formal','informal') DEFAULT 'formal',
	`keyStructures` json,
	`keyVocabulary` json,
	`scoringNotes` text,
	`needsReview` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sle_model_answers_id` PRIMARY KEY(`id`),
	CONSTRAINT `sle_model_answers_answerId_unique` UNIQUE(`answerId`)
);
--> statement-breakpoint
CREATE TABLE `sle_oral_scenarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scenarioId` varchar(36) NOT NULL,
	`language` enum('fr','en') NOT NULL,
	`targetLevel` enum('A','B','C') NOT NULL,
	`topicDomain` enum('HR','Finance','Operations','Policy','Service','IT','Leadership','Environment','Communications','Diversity','Workplace','Project') NOT NULL,
	`durationTag` enum('quick_drill','full_simulation') NOT NULL,
	`contextPrompt` text NOT NULL,
	`examinerRole` text,
	`aiSystemPrompt` text,
	`questionSequence` json NOT NULL,
	`expectedFunctions` json NOT NULL,
	`expectedVocabulary` json,
	`registerConstraints` json,
	`scoringFocus` json NOT NULL,
	`tags` json,
	`needsReview` boolean DEFAULT false,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sle_oral_scenarios_id` PRIMARY KEY(`id`),
	CONSTRAINT `sle_oral_scenarios_scenarioId_unique` UNIQUE(`scenarioId`)
);
--> statement-breakpoint
CREATE TABLE `sle_proficiency_standards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`levelId` varchar(2) NOT NULL,
	`descriptionFr` text NOT NULL,
	`descriptionEn` text NOT NULL,
	`minScoreReading` int NOT NULL,
	`minScoreWriting` int NOT NULL,
	`minScoreOral` int NOT NULL,
	`oralComplexityRubric` json,
	`passThreshold` int NOT NULL,
	`sustainedPerformanceWindow` int DEFAULT 5,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sle_proficiency_standards_id` PRIMARY KEY(`id`),
	CONSTRAINT `sle_proficiency_standards_levelId_unique` UNIQUE(`levelId`)
);
--> statement-breakpoint
CREATE TABLE `sle_skill_trend` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`criterionName` enum('grammar','vocabulary','fluency','pronunciation','comprehension') NOT NULL,
	`dateBucket` varchar(10) NOT NULL,
	`avgScore` decimal(5,2) NOT NULL,
	`sessionCount` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sle_skill_trend_id` PRIMARY KEY(`id`),
	CONSTRAINT `skill_trend_user_criterion_date_idx` UNIQUE(`userId`,`criterionName`,`dateBucket`)
);
--> statement-breakpoint
CREATE TABLE `sle_user_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`l1` enum('fr','en') NOT NULL,
	`l2` enum('fr','en') NOT NULL,
	`currentEstimatedLevel` enum('X','A','B','C'),
	`targetLevel` enum('A','B','C'),
	`goals` json,
	`weakThemes` json,
	`totalSessions` int DEFAULT 0,
	`totalPracticeMinutes` int DEFAULT 0,
	`lastSessionDate` timestamp,
	`streakDays` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sle_user_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `sle_user_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `sle_user_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(36) NOT NULL,
	`userId` int,
	`mode` enum('training','exam_simulation','micro_learning','quick_drill') NOT NULL,
	`language` enum('fr','en') NOT NULL,
	`targetLevel` enum('A','B','C') NOT NULL,
	`coachKey` enum('STEVEN','PRECIOSA') NOT NULL,
	`scenarioId` varchar(36),
	`startTime` timestamp NOT NULL DEFAULT (now()),
	`endTime` timestamp,
	`aggregateScore` int,
	`criterionScores` json,
	`passed` boolean,
	`levelAchieved` enum('X','A','B','C'),
	`totalTurns` int DEFAULT 0,
	`totalDurationSeconds` int,
	`modelId` varchar(100),
	`promptVersion` varchar(50),
	`systemPromptHash` varchar(64),
	`feedback` text,
	`recommendations` json,
	`status` enum('active','completed','abandoned','error') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sle_user_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `sle_user_sessions_sessionId_unique` UNIQUE(`sessionId`)
);
--> statement-breakpoint
ALTER TABLE `sle_companion_sessions` MODIFY COLUMN `userId` int;--> statement-breakpoint
ALTER TABLE `coach_profiles` ADD `headlineFr` varchar(200);--> statement-breakpoint
ALTER TABLE `coach_profiles` ADD `bioFr` text;--> statement-breakpoint
ALTER TABLE `sle_companion_sessions` ADD `orchestratorState` json;--> statement-breakpoint
ALTER TABLE `sle_companion_sessions` ADD `difficultyState` json;--> statement-breakpoint
ALTER TABLE `sle_companion_sessions` ADD `sessionMode` varchar(30) DEFAULT 'training';--> statement-breakpoint
ALTER TABLE `sle_skill_trend` ADD CONSTRAINT `sle_skill_trend_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sle_user_profiles` ADD CONSTRAINT `sle_user_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sle_user_sessions` ADD CONSTRAINT `sle_user_sessions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;