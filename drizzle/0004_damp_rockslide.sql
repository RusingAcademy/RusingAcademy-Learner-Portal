CREATE TABLE `department_inquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(50),
	`department` varchar(200) NOT NULL,
	`teamSize` varchar(50) NOT NULL,
	`message` text NOT NULL,
	`preferredPackage` varchar(50),
	`status` enum('new','contacted','in_progress','converted','closed') DEFAULT 'new',
	`assignedTo` int,
	`notes` text,
	`followUpDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `department_inquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `department_inquiries` ADD CONSTRAINT `department_inquiries_assignedTo_users_id_fk` FOREIGN KEY (`assignedTo`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;