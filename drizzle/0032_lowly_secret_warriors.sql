CREATE TABLE `crm_tag_automation_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` varchar(255),
	`tagId` int NOT NULL,
	`conditionType` varchar(50) NOT NULL,
	`conditionValue` varchar(100) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`priority` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crm_tag_automation_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `crm_tag_automation_rules` ADD CONSTRAINT `crm_tag_automation_rules_tagId_crm_lead_tags_id_fk` FOREIGN KEY (`tagId`) REFERENCES `crm_lead_tags`(`id`) ON DELETE no action ON UPDATE no action;