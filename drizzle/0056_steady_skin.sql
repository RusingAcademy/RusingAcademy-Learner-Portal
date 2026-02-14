CREATE TABLE `admin_invitations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`role` enum('admin','hr_admin','coach','learner','user') NOT NULL DEFAULT 'learner',
	`token` varchar(255) NOT NULL,
	`invitedBy` int NOT NULL,
	`status` enum('pending','accepted','revoked','expired') NOT NULL DEFAULT 'pending',
	`expiresAt` timestamp NOT NULL,
	`acceptedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_invitations_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_invitations_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
ALTER TABLE `admin_invitations` ADD CONSTRAINT `admin_invitations_invitedBy_users_id_fk` FOREIGN KEY (`invitedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;