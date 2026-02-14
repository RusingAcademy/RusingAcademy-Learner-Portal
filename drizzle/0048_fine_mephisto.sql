ALTER TABLE `learner_profiles` ADD `certificationDate` timestamp;--> statement-breakpoint
ALTER TABLE `learner_profiles` ADD `certificationExpiry` timestamp;--> statement-breakpoint
ALTER TABLE `learner_profiles` ADD `certifiedLevel` json;--> statement-breakpoint
ALTER TABLE `learner_profiles` ADD `weeklyStudyHours` decimal(4,1) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `learner_profiles` ADD `lessonsCompleted` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `learner_profiles` ADD `quizzesPassed` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `learner_profiles` ADD `lastAssessmentScore` int;--> statement-breakpoint
ALTER TABLE `learner_profiles` ADD `lastAssessmentDate` timestamp;