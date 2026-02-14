ALTER TABLE `coach_profiles` ADD `calendarType` enum('internal','calendly') DEFAULT 'internal';--> statement-breakpoint
ALTER TABLE `coach_profiles` ADD `calendlyUrl` varchar(500);