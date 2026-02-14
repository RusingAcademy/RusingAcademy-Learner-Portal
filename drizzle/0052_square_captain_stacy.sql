ALTER TABLE `activities` ADD `slotIndex` int;--> statement-breakpoint
ALTER TABLE `activities` ADD `slotType` enum('introduction','video_scenario','grammar_point','written_practice','oral_practice','quiz_slot','coaching_tip');--> statement-breakpoint
ALTER TABLE `activities` ADD `titleFr` varchar(200);--> statement-breakpoint
ALTER TABLE `activities` ADD `descriptionFr` text;--> statement-breakpoint
ALTER TABLE `activities` ADD `contentFr` text;--> statement-breakpoint
ALTER TABLE `activities` ADD `contentJsonFr` json;--> statement-breakpoint
ALTER TABLE `course_modules` ADD `titleFr` varchar(200);--> statement-breakpoint
ALTER TABLE `course_modules` ADD `descriptionFr` text;--> statement-breakpoint
ALTER TABLE `course_modules` ADD `badgeImageUrl` text;--> statement-breakpoint
ALTER TABLE `courses` ADD `titleFr` varchar(200);--> statement-breakpoint
ALTER TABLE `courses` ADD `descriptionFr` text;--> statement-breakpoint
ALTER TABLE `courses` ADD `shortDescriptionFr` varchar(500);--> statement-breakpoint
ALTER TABLE `courses` ADD `pathCompletionBadgeUrl` text;--> statement-breakpoint
ALTER TABLE `lessons` ADD `titleFr` varchar(200);--> statement-breakpoint
ALTER TABLE `lessons` ADD `descriptionFr` text;