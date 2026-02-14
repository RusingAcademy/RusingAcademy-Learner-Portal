ALTER TABLE `coach_profiles` ADD `profileComplete` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `learner_profiles` ADD `weeklyReportEnabled` boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE `learner_profiles` ADD `weeklyReportDay` int DEFAULT 0;