CREATE TABLE `coupon_redemptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`couponId` int NOT NULL,
	`userId` int NOT NULL,
	`sessionId` int,
	`discountAmount` int NOT NULL,
	`originalAmount` int NOT NULL,
	`finalAmount` int NOT NULL,
	`redeemedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coupon_redemptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promo_coupons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`descriptionFr` text,
	`discountType` enum('percentage','fixed_amount','free_trial') NOT NULL,
	`discountValue` int NOT NULL,
	`maxUses` int,
	`usedCount` int NOT NULL DEFAULT 0,
	`maxUsesPerUser` int NOT NULL DEFAULT 1,
	`minPurchaseAmount` int,
	`validFrom` timestamp NOT NULL DEFAULT (now()),
	`validUntil` timestamp,
	`applicableTo` enum('all','trial','single','package') NOT NULL DEFAULT 'all',
	`newUsersOnly` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `promo_coupons_id` PRIMARY KEY(`id`),
	CONSTRAINT `promo_coupons_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `referral_invitations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerId` int NOT NULL,
	`referralCode` varchar(50) NOT NULL,
	`inviteeEmail` varchar(320),
	`inviteMethod` enum('email','link','social') NOT NULL DEFAULT 'link',
	`status` enum('pending','clicked','registered','converted','expired') NOT NULL DEFAULT 'pending',
	`inviteeId` int,
	`convertedSessionId` int,
	`referrerRewardPoints` int DEFAULT 0,
	`referrerRewardPaid` boolean DEFAULT false,
	`inviteeRewardPoints` int DEFAULT 0,
	`inviteeRewardPaid` boolean DEFAULT false,
	`clickedAt` timestamp,
	`registeredAt` timestamp,
	`convertedAt` timestamp,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referral_invitations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `coupon_redemptions` ADD CONSTRAINT `coupon_redemptions_couponId_promo_coupons_id_fk` FOREIGN KEY (`couponId`) REFERENCES `promo_coupons`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coupon_redemptions` ADD CONSTRAINT `coupon_redemptions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `coupon_redemptions` ADD CONSTRAINT `coupon_redemptions_sessionId_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `sessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `promo_coupons` ADD CONSTRAINT `promo_coupons_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referral_invitations` ADD CONSTRAINT `referral_invitations_referrerId_users_id_fk` FOREIGN KEY (`referrerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referral_invitations` ADD CONSTRAINT `referral_invitations_inviteeId_users_id_fk` FOREIGN KEY (`inviteeId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `referral_invitations` ADD CONSTRAINT `referral_invitations_convertedSessionId_sessions_id_fk` FOREIGN KEY (`convertedSessionId`) REFERENCES `sessions`(`id`) ON DELETE no action ON UPDATE no action;