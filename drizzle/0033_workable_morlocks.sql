CREATE TABLE `crm_lead_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`userId` int,
	`action` enum('created','updated','status_changed','score_changed','assigned','tag_added','tag_removed','note_added','email_sent','meeting_scheduled','imported','merged','deleted') NOT NULL,
	`fieldName` varchar(100),
	`oldValue` text,
	`newValue` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crm_lead_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_lead_segments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` varchar(255),
	`filters` json NOT NULL,
	`filterLogic` enum('and','or') NOT NULL DEFAULT 'and',
	`color` varchar(7) DEFAULT '#3b82f6',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_lead_segments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `crm_lead_history` ADD CONSTRAINT `crm_lead_history_leadId_ecosystem_leads_id_fk` FOREIGN KEY (`leadId`) REFERENCES `ecosystem_leads`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `crm_lead_history` ADD CONSTRAINT `crm_lead_history_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `crm_lead_segments` ADD CONSTRAINT `crm_lead_segments_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;