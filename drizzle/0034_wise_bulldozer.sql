CREATE TABLE `crm_segment_alert_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alertId` int NOT NULL,
	`segmentId` int NOT NULL,
	`leadId` int,
	`eventType` enum('entered','exited','threshold') NOT NULL,
	`message` text,
	`notificationSent` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crm_segment_alert_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_segment_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`segmentId` int NOT NULL,
	`alertType` enum('lead_entered','lead_exited','threshold_reached') NOT NULL,
	`thresholdValue` int,
	`notifyEmail` boolean DEFAULT true,
	`notifyWebhook` boolean DEFAULT false,
	`webhookUrl` varchar(500),
	`recipients` varchar(500) DEFAULT 'owner',
	`isActive` boolean NOT NULL DEFAULT true,
	`lastTriggeredAt` timestamp,
	`triggerCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_segment_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `crm_segment_alert_logs` ADD CONSTRAINT `crm_segment_alert_logs_alertId_crm_segment_alerts_id_fk` FOREIGN KEY (`alertId`) REFERENCES `crm_segment_alerts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `crm_segment_alert_logs` ADD CONSTRAINT `crm_segment_alert_logs_segmentId_crm_lead_segments_id_fk` FOREIGN KEY (`segmentId`) REFERENCES `crm_lead_segments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `crm_segment_alert_logs` ADD CONSTRAINT `crm_segment_alert_logs_leadId_ecosystem_leads_id_fk` FOREIGN KEY (`leadId`) REFERENCES `ecosystem_leads`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `crm_segment_alerts` ADD CONSTRAINT `crm_segment_alerts_segmentId_crm_lead_segments_id_fk` FOREIGN KEY (`segmentId`) REFERENCES `crm_lead_segments`(`id`) ON DELETE no action ON UPDATE no action;