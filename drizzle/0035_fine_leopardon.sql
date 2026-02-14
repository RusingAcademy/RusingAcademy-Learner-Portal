CREATE TABLE `crm_sales_goal_milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`goalId` int NOT NULL,
	`milestoneValue` int NOT NULL,
	`reachedAt` timestamp,
	`notificationSent` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crm_sales_goal_milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crm_sales_goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`goalType` enum('revenue','deals','leads','meetings','conversions') NOT NULL,
	`targetValue` int NOT NULL,
	`currentValue` int NOT NULL DEFAULT 0,
	`period` enum('weekly','monthly','quarterly','yearly') NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`assignedTo` int,
	`status` enum('active','completed','missed','cancelled') NOT NULL DEFAULT 'active',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crm_sales_goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `crm_sales_goal_milestones` ADD CONSTRAINT `crm_sales_goal_milestones_goalId_crm_sales_goals_id_fk` FOREIGN KEY (`goalId`) REFERENCES `crm_sales_goals`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `crm_sales_goals` ADD CONSTRAINT `crm_sales_goals_assignedTo_users_id_fk` FOREIGN KEY (`assignedTo`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `crm_sales_goals` ADD CONSTRAINT `crm_sales_goals_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;