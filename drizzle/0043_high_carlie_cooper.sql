CREATE TABLE `cohort_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cohortId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('member','lead') DEFAULT 'member',
	`currentProgress` int DEFAULT 0,
	`lastActiveAt` timestamp,
	`status` enum('active','inactive','completed') DEFAULT 'active',
	`addedBy` int,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cohort_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cohorts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`department` varchar(200),
	`manager` varchar(255),
	`managerEmail` varchar(320),
	`targetLevel` json,
	`targetDate` timestamp,
	`status` enum('active','inactive','completed','archived') DEFAULT 'active',
	`memberCount` int DEFAULT 0,
	`avgProgress` int DEFAULT 0,
	`completionRate` int DEFAULT 0,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cohorts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `course_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`cohortId` int,
	`userId` int,
	`courseId` int,
	`pathId` int,
	`assignmentType` enum('required','optional','recommended') DEFAULT 'required',
	`priority` int DEFAULT 0,
	`startDate` timestamp,
	`dueDate` timestamp,
	`targetLevel` enum('BBB','CBC','CCC'),
	`status` enum('active','completed','cancelled','expired') DEFAULT 'active',
	`assignedBy` int,
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`notes` text,
	CONSTRAINT `course_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hr_audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`userId` int NOT NULL,
	`action` enum('cohort_created','cohort_updated','cohort_deleted','member_added','member_removed','course_assigned','course_unassigned','report_exported','learner_invited','settings_changed') NOT NULL,
	`targetType` varchar(50),
	`targetId` int,
	`details` json,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `hr_audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('owner','admin','hr_admin','coach','learner','user') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `roleId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `isOwner` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `cohort_members` ADD CONSTRAINT `cohort_members_cohortId_cohorts_id_fk` FOREIGN KEY (`cohortId`) REFERENCES `cohorts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cohort_members` ADD CONSTRAINT `cohort_members_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cohort_members` ADD CONSTRAINT `cohort_members_addedBy_users_id_fk` FOREIGN KEY (`addedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cohorts` ADD CONSTRAINT `cohorts_organizationId_organizations_id_fk` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cohorts` ADD CONSTRAINT `cohorts_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_assignments` ADD CONSTRAINT `course_assignments_organizationId_organizations_id_fk` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_assignments` ADD CONSTRAINT `course_assignments_cohortId_cohorts_id_fk` FOREIGN KEY (`cohortId`) REFERENCES `cohorts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_assignments` ADD CONSTRAINT `course_assignments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_assignments` ADD CONSTRAINT `course_assignments_courseId_courses_id_fk` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_assignments` ADD CONSTRAINT `course_assignments_assignedBy_users_id_fk` FOREIGN KEY (`assignedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hr_audit_log` ADD CONSTRAINT `hr_audit_log_organizationId_organizations_id_fk` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `hr_audit_log` ADD CONSTRAINT `hr_audit_log_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;