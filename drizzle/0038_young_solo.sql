CREATE TABLE `community_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`titleFr` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`descriptionFr` text NOT NULL,
	`slug` varchar(300) NOT NULL,
	`eventType` enum('workshop','networking','practice','info_session','webinar','other') DEFAULT 'workshop',
	`startAt` timestamp NOT NULL,
	`endAt` timestamp NOT NULL,
	`timezone` varchar(50) DEFAULT 'America/Toronto',
	`locationType` enum('virtual','in_person','hybrid') DEFAULT 'virtual',
	`locationDetails` varchar(255),
	`meetingUrl` text,
	`maxCapacity` int,
	`currentRegistrations` int DEFAULT 0,
	`waitlistEnabled` boolean DEFAULT false,
	`price` int DEFAULT 0,
	`hostId` int,
	`hostName` varchar(100),
	`status` enum('draft','published','cancelled','completed') DEFAULT 'draft',
	`imageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `community_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `community_events_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `event_registrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`userId` int NOT NULL,
	`status` enum('registered','waitlisted','cancelled','attended','no_show') DEFAULT 'registered',
	`registeredAt` timestamp NOT NULL DEFAULT (now()),
	`cancelledAt` timestamp,
	`attendedAt` timestamp,
	`email` varchar(320),
	`name` varchar(100),
	`stripePaymentId` varchar(100),
	`amountPaid` int DEFAULT 0,
	`reminderSent` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `event_registrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `forum_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`nameFr` varchar(100) NOT NULL,
	`description` text,
	`descriptionFr` text,
	`slug` varchar(100) NOT NULL,
	`icon` varchar(50),
	`color` varchar(20),
	`sortOrder` int DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`threadCount` int DEFAULT 0,
	`postCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `forum_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `forum_categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `forum_post_likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `forum_post_likes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `forum_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`threadId` int NOT NULL,
	`authorId` int NOT NULL,
	`content` text NOT NULL,
	`isEdited` boolean DEFAULT false,
	`editedAt` timestamp,
	`likeCount` int DEFAULT 0,
	`status` enum('active','hidden','deleted') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `forum_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `forum_threads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int NOT NULL,
	`authorId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(300) NOT NULL,
	`content` text NOT NULL,
	`isPinned` boolean DEFAULT false,
	`isLocked` boolean DEFAULT false,
	`viewCount` int DEFAULT 0,
	`replyCount` int DEFAULT 0,
	`lastReplyAt` timestamp,
	`lastReplyById` int,
	`status` enum('active','hidden','deleted') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `forum_threads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `community_events` ADD CONSTRAINT `community_events_hostId_users_id_fk` FOREIGN KEY (`hostId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `event_registrations` ADD CONSTRAINT `event_registrations_eventId_community_events_id_fk` FOREIGN KEY (`eventId`) REFERENCES `community_events`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `event_registrations` ADD CONSTRAINT `event_registrations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `forum_post_likes` ADD CONSTRAINT `forum_post_likes_postId_forum_posts_id_fk` FOREIGN KEY (`postId`) REFERENCES `forum_posts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `forum_post_likes` ADD CONSTRAINT `forum_post_likes_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `forum_posts` ADD CONSTRAINT `forum_posts_threadId_forum_threads_id_fk` FOREIGN KEY (`threadId`) REFERENCES `forum_threads`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `forum_posts` ADD CONSTRAINT `forum_posts_authorId_users_id_fk` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `forum_threads` ADD CONSTRAINT `forum_threads_categoryId_forum_categories_id_fk` FOREIGN KEY (`categoryId`) REFERENCES `forum_categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `forum_threads` ADD CONSTRAINT `forum_threads_authorId_users_id_fk` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `forum_threads` ADD CONSTRAINT `forum_threads_lastReplyById_users_id_fk` FOREIGN KEY (`lastReplyById`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;