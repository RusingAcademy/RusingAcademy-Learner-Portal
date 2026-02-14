CREATE TABLE `newsletter_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`firstName` varchar(100),
	`lastName` varchar(100),
	`brand` enum('ecosystem','rusingacademy','lingueefy','barholex') NOT NULL,
	`interests` json,
	`language` enum('en','fr') NOT NULL DEFAULT 'en',
	`status` enum('active','unsubscribed','bounced') NOT NULL DEFAULT 'active',
	`source` varchar(100),
	`confirmedAt` timestamp,
	`unsubscribedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `newsletter_subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsletter_subscriptions_email_unique` UNIQUE(`email`)
);
