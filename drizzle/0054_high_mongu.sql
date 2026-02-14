ALTER TABLE `activities` ADD `slotNumber` int;--> statement-breakpoint
ALTER TABLE `activities` ADD `isRequired` boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE `course_modules` ADD `moduleNumber` int;--> statement-breakpoint
ALTER TABLE `courses` ADD `heroImageUrl` text;--> statement-breakpoint
ALTER TABLE `courses` ADD `pathNumber` int;--> statement-breakpoint
ALTER TABLE `courses` ADD `estimatedHours` int DEFAULT 30;--> statement-breakpoint
ALTER TABLE `lessons` ADD `lessonNumber` int;--> statement-breakpoint
ALTER TABLE `lessons` ADD `totalSlots` int DEFAULT 7;--> statement-breakpoint
ALTER TABLE `lessons` ADD `slotsCompleted` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `lessons` ADD `qualityGateStatus` enum('pending','pass','fail') DEFAULT 'pending';