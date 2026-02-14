ALTER TABLE `ecosystem_leads` ADD `emailOptOut` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `ecosystem_leads` ADD `emailOptOutDate` timestamp;--> statement-breakpoint
ALTER TABLE `ecosystem_leads` ADD `emailOptOutReason` varchar(255);