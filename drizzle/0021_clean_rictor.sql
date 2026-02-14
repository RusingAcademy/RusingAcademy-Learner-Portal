ALTER TABLE `coach_applications` ADD `previousRejectionReason` text;--> statement-breakpoint
ALTER TABLE `coach_applications` ADD `resubmissionCount` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `coach_applications` ADD `lastResubmittedAt` timestamp;--> statement-breakpoint
ALTER TABLE `coach_applications` ADD `isResubmission` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `coach_applications` ADD `parentApplicationId` int;--> statement-breakpoint
ALTER TABLE `coach_applications` ADD CONSTRAINT `coach_applications_parentApplicationId_coach_applications_id_fk` FOREIGN KEY (`parentApplicationId`) REFERENCES `coach_applications`(`id`) ON DELETE no action ON UPDATE no action;