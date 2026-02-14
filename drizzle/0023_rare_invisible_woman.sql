CREATE TABLE `admin_performance_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`totalReviewed` int DEFAULT 0,
	`totalApproved` int DEFAULT 0,
	`totalRejected` int DEFAULT 0,
	`averageReviewTimeHours` decimal(8,2) DEFAULT 0,
	`approvalRate` int DEFAULT 0,
	`rejectionRate` int DEFAULT 0,
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_performance_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `application_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicationId` int NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`parentCommentId` int,
	`isInternal` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `application_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `application_reminders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicationId` int NOT NULL,
	`slaHours` int DEFAULT 168,
	`submittedAt` timestamp NOT NULL,
	`dueAt` timestamp NOT NULL,
	`reminderSentAt` timestamp,
	`reminderCount` int DEFAULT 0,
	`lastReminderAt` timestamp,
	`isOverdue` boolean DEFAULT false,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `application_reminders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `admin_performance_metrics` ADD CONSTRAINT `admin_performance_metrics_adminId_users_id_fk` FOREIGN KEY (`adminId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `application_comments` ADD CONSTRAINT `application_comments_applicationId_coach_applications_id_fk` FOREIGN KEY (`applicationId`) REFERENCES `coach_applications`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `application_comments` ADD CONSTRAINT `application_comments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `application_comments` ADD CONSTRAINT `application_comments_parentCommentId_application_comments_id_fk` FOREIGN KEY (`parentCommentId`) REFERENCES `application_comments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `application_reminders` ADD CONSTRAINT `application_reminders_applicationId_coach_applications_id_fk` FOREIGN KEY (`applicationId`) REFERENCES `coach_applications`(`id`) ON DELETE cascade ON UPDATE no action;