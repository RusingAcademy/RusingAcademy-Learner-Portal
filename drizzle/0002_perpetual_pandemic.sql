CREATE TABLE `coach_commissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`coachId` int NOT NULL,
	`tierId` int NOT NULL,
	`overrideCommissionBps` int,
	`overrideReason` text,
	`isVerifiedSle` boolean DEFAULT false,
	`verifiedAt` timestamp,
	`verifiedBy` int,
	`totalHoursTaught` decimal(10,2) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coach_commissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coach_payouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`coachId` int NOT NULL,
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`grossEarnings` int NOT NULL,
	`totalPlatformFees` int NOT NULL,
	`netPayout` int NOT NULL,
	`sessionCount` int NOT NULL,
	`trialSessionCount` int DEFAULT 0,
	`stripePayoutId` varchar(100),
	`status` enum('pending','processing','paid','failed') DEFAULT 'pending',
	`paidAt` timestamp,
	`failureReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coach_payouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `commission_tiers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`tierType` enum('verified_sle','standard','referral') NOT NULL,
	`commissionBps` int NOT NULL,
	`minHours` int DEFAULT 0,
	`maxHours` int,
	`priority` int DEFAULT 100,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commission_tiers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payout_ledger` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int,
	`packageId` int,
	`coachId` int NOT NULL,
	`learnerId` int NOT NULL,
	`transactionType` enum('session_payment','platform_fee','coach_payout','refund','refund_reversal','chargeback','chargeback_reversal') NOT NULL,
	`grossAmount` int NOT NULL,
	`platformFee` int NOT NULL,
	`netAmount` int NOT NULL,
	`commissionBps` int NOT NULL,
	`commissionTierId` int,
	`referralLinkId` int,
	`isTrialSession` boolean DEFAULT false,
	`stripePaymentIntentId` varchar(100),
	`stripeTransferId` varchar(100),
	`stripeRefundId` varchar(100),
	`status` enum('pending','processing','completed','failed','reversed') DEFAULT 'pending',
	`processedAt` timestamp,
	`failureReason` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payout_ledger_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `platform_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` json NOT NULL,
	`description` text,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `platform_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `platform_settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `referral_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`coachId` int NOT NULL,
	`code` varchar(20) NOT NULL,
	`discountCommissionBps` int DEFAULT 500,
	`clickCount` int DEFAULT 0,
	`signupCount` int DEFAULT 0,
	`bookingCount` int DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referral_links_id` PRIMARY KEY(`id`),
	CONSTRAINT `referral_links_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `referral_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referralLinkId` int NOT NULL,
	`learnerId` int NOT NULL,
	`attributedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referral_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `coach_commissions` ADD CONSTRAINT `coach_commissions_coachId_coach_profiles_id_fk` FOREIGN KEY (`coachId`) REFERENCES `coach_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coach_commissions` ADD CONSTRAINT `coach_commissions_tierId_commission_tiers_id_fk` FOREIGN KEY (`tierId`) REFERENCES `commission_tiers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coach_commissions` ADD CONSTRAINT `coach_commissions_verifiedBy_users_id_fk` FOREIGN KEY (`verifiedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coach_payouts` ADD CONSTRAINT `coach_payouts_coachId_coach_profiles_id_fk` FOREIGN KEY (`coachId`) REFERENCES `coach_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payout_ledger` ADD CONSTRAINT `payout_ledger_sessionId_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payout_ledger` ADD CONSTRAINT `payout_ledger_packageId_packages_id_fk` FOREIGN KEY (`packageId`) REFERENCES `packages`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payout_ledger` ADD CONSTRAINT `payout_ledger_coachId_coach_profiles_id_fk` FOREIGN KEY (`coachId`) REFERENCES `coach_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payout_ledger` ADD CONSTRAINT `payout_ledger_learnerId_learner_profiles_id_fk` FOREIGN KEY (`learnerId`) REFERENCES `learner_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payout_ledger` ADD CONSTRAINT `payout_ledger_commissionTierId_commission_tiers_id_fk` FOREIGN KEY (`commissionTierId`) REFERENCES `commission_tiers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payout_ledger` ADD CONSTRAINT `payout_ledger_referralLinkId_referral_links_id_fk` FOREIGN KEY (`referralLinkId`) REFERENCES `referral_links`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `platform_settings` ADD CONSTRAINT `platform_settings_updatedBy_users_id_fk` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referral_links` ADD CONSTRAINT `referral_links_coachId_coach_profiles_id_fk` FOREIGN KEY (`coachId`) REFERENCES `coach_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referral_tracking` ADD CONSTRAINT `referral_tracking_referralLinkId_referral_links_id_fk` FOREIGN KEY (`referralLinkId`) REFERENCES `referral_links`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referral_tracking` ADD CONSTRAINT `referral_tracking_learnerId_learner_profiles_id_fk` FOREIGN KEY (`learnerId`) REFERENCES `learner_profiles`(`id`) ON DELETE no action ON UPDATE no action;