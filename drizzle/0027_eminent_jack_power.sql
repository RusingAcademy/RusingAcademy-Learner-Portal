CREATE TABLE `ecosystem_cross_sell_opportunities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`sourcePlatform` enum('lingueefy','rusingacademy','barholex','ecosystem_hub','external') NOT NULL,
	`targetPlatform` enum('lingueefy','rusingacademy','barholex','ecosystem_hub','external') NOT NULL,
	`opportunityType` varchar(100) NOT NULL,
	`description` text,
	`estimatedValue` decimal(10,2),
	`crossSellStatus` enum('identified','pitched','interested','converted','declined') DEFAULT 'identified',
	`identifiedAt` timestamp NOT NULL DEFAULT (now()),
	`convertedAt` timestamp,
	CONSTRAINT `ecosystem_cross_sell_opportunities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ecosystem_lead_activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`activityType` enum('created','status_changed','assigned','contacted','note_added','email_sent','call_made','meeting_scheduled','proposal_sent','converted','cross_sell_identified') NOT NULL,
	`description` text,
	`previousValue` varchar(255),
	`newValue` varchar(255),
	`metadata` json,
	`performedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ecosystem_lead_activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ecosystem_lead_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`content` text NOT NULL,
	`isPinned` boolean DEFAULT false,
	`authorId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ecosystem_lead_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ecosystem_leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(50),
	`company` varchar(255),
	`jobTitle` varchar(100),
	`source` enum('lingueefy','rusingacademy','barholex','ecosystem_hub','external') NOT NULL,
	`formType` varchar(50) NOT NULL,
	`leadType` enum('individual','organization','government','enterprise') DEFAULT 'individual',
	`leadStatus` enum('new','contacted','qualified','proposal_sent','negotiating','won','lost','nurturing') DEFAULT 'new',
	`message` text,
	`interests` json,
	`budget` varchar(50),
	`timeline` varchar(50),
	`leadPreferredLanguage` enum('en','fr') DEFAULT 'en',
	`assignedTo` int,
	`leadScore` int DEFAULT 0,
	`qualificationNotes` text,
	`crossSellOpportunities` json,
	`linkedUserId` int,
	`utmSource` varchar(100),
	`utmMedium` varchar(100),
	`utmCampaign` varchar(100),
	`referrer` varchar(500),
	`ipAddress` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastContactedAt` timestamp,
	`convertedAt` timestamp,
	CONSTRAINT `ecosystem_leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `ecosystem_cross_sell_opportunities` ADD CONSTRAINT `ecosystem_cross_sell_opportunities_leadId_ecosystem_leads_id_fk` FOREIGN KEY (`leadId`) REFERENCES `ecosystem_leads`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ecosystem_lead_activities` ADD CONSTRAINT `ecosystem_lead_activities_leadId_ecosystem_leads_id_fk` FOREIGN KEY (`leadId`) REFERENCES `ecosystem_leads`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ecosystem_lead_activities` ADD CONSTRAINT `ecosystem_lead_activities_performedBy_users_id_fk` FOREIGN KEY (`performedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ecosystem_lead_notes` ADD CONSTRAINT `ecosystem_lead_notes_leadId_ecosystem_leads_id_fk` FOREIGN KEY (`leadId`) REFERENCES `ecosystem_leads`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ecosystem_lead_notes` ADD CONSTRAINT `ecosystem_lead_notes_authorId_users_id_fk` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ecosystem_leads` ADD CONSTRAINT `ecosystem_leads_assignedTo_users_id_fk` FOREIGN KEY (`assignedTo`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ecosystem_leads` ADD CONSTRAINT `ecosystem_leads_linkedUserId_users_id_fk` FOREIGN KEY (`linkedUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;