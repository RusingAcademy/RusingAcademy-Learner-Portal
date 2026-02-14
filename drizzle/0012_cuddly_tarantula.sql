CREATE TABLE `coach_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`coachId` int NOT NULL,
	`applicationId` int,
	`documentType` enum('id_proof','degree','teaching_cert','sle_results','language_cert','background_check','other') NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text,
	`fileUrl` text NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileSize` int,
	`mimeType` varchar(100),
	`issueDate` timestamp,
	`expiryDate` timestamp,
	`issuingAuthority` varchar(200),
	`documentNumber` varchar(100),
	`status` enum('pending','verified','rejected','expired') DEFAULT 'pending',
	`verifiedBy` int,
	`verifiedAt` timestamp,
	`rejectionReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coach_documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stripe_connect_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`coachId` int NOT NULL,
	`stripeAccountId` varchar(100) NOT NULL,
	`accountType` enum('express','standard','custom') DEFAULT 'express',
	`onboardingComplete` boolean DEFAULT false,
	`chargesEnabled` boolean DEFAULT false,
	`payoutsEnabled` boolean DEFAULT false,
	`detailsSubmitted` boolean DEFAULT false,
	`businessType` varchar(50),
	`country` varchar(2),
	`defaultCurrency` varchar(3),
	`payoutSchedule` enum('daily','weekly','monthly') DEFAULT 'weekly',
	`payoutDay` int,
	`requirementsCurrentlyDue` json,
	`requirementsPastDue` json,
	`requirementsEventuallyDue` json,
	`lastWebhookAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stripe_connect_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `stripe_connect_accounts_coachId_unique` UNIQUE(`coachId`),
	CONSTRAINT `stripe_connect_accounts_stripeAccountId_unique` UNIQUE(`stripeAccountId`)
);
--> statement-breakpoint
ALTER TABLE `coach_documents` ADD CONSTRAINT `coach_documents_coachId_coach_profiles_id_fk` FOREIGN KEY (`coachId`) REFERENCES `coach_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coach_documents` ADD CONSTRAINT `coach_documents_applicationId_coach_applications_id_fk` FOREIGN KEY (`applicationId`) REFERENCES `coach_applications`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coach_documents` ADD CONSTRAINT `coach_documents_verifiedBy_users_id_fk` FOREIGN KEY (`verifiedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stripe_connect_accounts` ADD CONSTRAINT `stripe_connect_accounts_coachId_coach_profiles_id_fk` FOREIGN KEY (`coachId`) REFERENCES `coach_profiles`(`id`) ON DELETE no action ON UPDATE no action;