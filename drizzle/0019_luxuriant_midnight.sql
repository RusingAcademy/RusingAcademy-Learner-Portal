ALTER TABLE `learner_profiles` ADD `currentStreak` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `learner_profiles` ADD `longestStreak` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `learner_profiles` ADD `lastSessionWeek` varchar(10);--> statement-breakpoint
ALTER TABLE `learner_profiles` ADD `streakFreezeUsed` boolean DEFAULT false;