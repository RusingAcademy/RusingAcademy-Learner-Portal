ALTER TABLE `messages` ADD `recipientId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `messages` ADD `read` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_recipientId_users_id_fk` FOREIGN KEY (`recipientId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;