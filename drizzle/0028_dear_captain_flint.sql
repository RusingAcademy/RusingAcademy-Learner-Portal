CREATE TABLE `crm_meetings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`organizerId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`meetingDate` timestamp NOT NULL,
	`durationMinutes` int NOT NULL DEFAULT 30,
	`meetingType` varchar(50) NOT NULL DEFAULT 'video',
	`meetingLink` varchar(500),
	`meetingStatus` varchar(50) NOT NULL DEFAULT 'scheduled',
	`notes` text,
	`outcome` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_meetings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `follow_up_sequences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`triggerType` varchar(50) NOT NULL DEFAULT 'manual',
	`targetScoreMin` int,
	`targetScoreMax` int,
	`targetStatuses` json,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `follow_up_sequences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lead_sequence_enrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`sequenceId` int NOT NULL,
	`currentStepId` int,
	`status` varchar(50) NOT NULL DEFAULT 'active',
	`enrolledAt` timestamp NOT NULL DEFAULT (now()),
	`nextEmailAt` timestamp,
	`completedAt` timestamp,
	CONSTRAINT `lead_sequence_enrollments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sequence_email_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`enrollmentId` int NOT NULL,
	`stepId` int NOT NULL,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	`opened` boolean NOT NULL DEFAULT false,
	`openedAt` timestamp,
	`clicked` boolean NOT NULL DEFAULT false,
	`clickedAt` timestamp,
	CONSTRAINT `sequence_email_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sequence_steps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sequenceId` int NOT NULL,
	`stepOrder` int NOT NULL,
	`delayDays` int NOT NULL DEFAULT 0,
	`delayHours` int NOT NULL DEFAULT 0,
	`emailSubjectEn` varchar(255) NOT NULL,
	`emailSubjectFr` varchar(255) NOT NULL,
	`emailBodyEn` text NOT NULL,
	`emailBodyFr` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sequence_steps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `crm_meetings` ADD CONSTRAINT `crm_meetings_leadId_ecosystem_leads_id_fk` FOREIGN KEY (`leadId`) REFERENCES `ecosystem_leads`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `crm_meetings` ADD CONSTRAINT `crm_meetings_organizerId_users_id_fk` FOREIGN KEY (`organizerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lead_sequence_enrollments` ADD CONSTRAINT `lead_sequence_enrollments_leadId_ecosystem_leads_id_fk` FOREIGN KEY (`leadId`) REFERENCES `ecosystem_leads`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lead_sequence_enrollments` ADD CONSTRAINT `lead_sequence_enrollments_sequenceId_follow_up_sequences_id_fk` FOREIGN KEY (`sequenceId`) REFERENCES `follow_up_sequences`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lead_sequence_enrollments` ADD CONSTRAINT `lead_sequence_enrollments_currentStepId_sequence_steps_id_fk` FOREIGN KEY (`currentStepId`) REFERENCES `sequence_steps`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sequence_email_logs` ADD CONSTRAINT `sequence_email_logs_enrollmentId_lead_sequence_enrollments_id_fk` FOREIGN KEY (`enrollmentId`) REFERENCES `lead_sequence_enrollments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sequence_email_logs` ADD CONSTRAINT `sequence_email_logs_stepId_sequence_steps_id_fk` FOREIGN KEY (`stepId`) REFERENCES `sequence_steps`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sequence_steps` ADD CONSTRAINT `sequence_steps_sequenceId_follow_up_sequences_id_fk` FOREIGN KEY (`sequenceId`) REFERENCES `follow_up_sequences`(`id`) ON DELETE no action ON UPDATE no action;