CREATE TABLE `coach_invitations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`coachProfileId` int NOT NULL,
	`token` varchar(64) NOT NULL,
	`email` varchar(320) NOT NULL,
	`status` enum('pending','claimed','expired','revoked') DEFAULT 'pending',
	`expiresAt` timestamp NOT NULL,
	`claimedAt` timestamp,
	`claimedByUserId` int,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coach_invitations_id` PRIMARY KEY(`id`),
	CONSTRAINT `coach_invitations_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
ALTER TABLE `coach_invitations` ADD CONSTRAINT `coach_invitations_coachProfileId_coach_profiles_id_fk` FOREIGN KEY (`coachProfileId`) REFERENCES `coach_profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coach_invitations` ADD CONSTRAINT `coach_invitations_claimedByUserId_users_id_fk` FOREIGN KEY (`claimedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coach_invitations` ADD CONSTRAINT `coach_invitations_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;