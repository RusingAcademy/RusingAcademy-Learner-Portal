CREATE TABLE `crm_team_goal_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`goalId` int NOT NULL,
	`userId` int NOT NULL,
	`individualTarget` int NOT NULL,
	`currentProgress` int NOT NULL DEFAULT 0,
	`rank` int,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crm_team_goal_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `crm_team_goal_assignments` ADD CONSTRAINT `crm_team_goal_assignments_goalId_crm_sales_goals_id_fk` FOREIGN KEY (`goalId`) REFERENCES `crm_sales_goals`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `crm_team_goal_assignments` ADD CONSTRAINT `crm_team_goal_assignments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;