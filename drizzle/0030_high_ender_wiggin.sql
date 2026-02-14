CREATE TABLE `crm_activity_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportType` enum('weekly','monthly','quarterly') NOT NULL,
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`data` json,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crm_activity_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_email_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`subject` varchar(500) NOT NULL,
	`body` text NOT NULL,
	`category` enum('welcome','follow_up','proposal','nurture','conversion','custom') NOT NULL DEFAULT 'custom',
	`language` enum('en','fr','both') NOT NULL DEFAULT 'en',
	`variables` json,
	`isDefault` boolean NOT NULL DEFAULT false,
	`createdBy` int,
	`usageCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_email_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_pipeline_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`notificationType` enum('stale_lead','stage_change','high_value','follow_up_due') NOT NULL,
	`message` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crm_pipeline_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `crm_email_templates` ADD CONSTRAINT `crm_email_templates_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `crm_pipeline_notifications` ADD CONSTRAINT `crm_pipeline_notifications_leadId_ecosystem_leads_id_fk` FOREIGN KEY (`leadId`) REFERENCES `ecosystem_leads`(`id`) ON DELETE no action ON UPDATE no action;