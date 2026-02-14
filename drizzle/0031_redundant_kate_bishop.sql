CREATE TABLE `crm_lead_tag_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`tagId` int NOT NULL,
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crm_lead_tag_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_lead_tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`color` varchar(20) NOT NULL DEFAULT '#6366f1',
	`description` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crm_lead_tags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `crm_lead_tag_assignments` ADD CONSTRAINT `crm_lead_tag_assignments_leadId_ecosystem_leads_id_fk` FOREIGN KEY (`leadId`) REFERENCES `ecosystem_leads`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `crm_lead_tag_assignments` ADD CONSTRAINT `crm_lead_tag_assignments_tagId_crm_lead_tags_id_fk` FOREIGN KEY (`tagId`) REFERENCES `crm_lead_tags`(`id`) ON DELETE no action ON UPDATE no action;