ALTER TABLE `coach_applications` ADD `firstName` varchar(100);--> statement-breakpoint
ALTER TABLE `coach_applications` ADD `lastName` varchar(100);--> statement-breakpoint
ALTER TABLE `coach_applications` ADD `city` varchar(100);--> statement-breakpoint
ALTER TABLE `coach_applications` ADD `country` varchar(100);--> statement-breakpoint
ALTER TABLE `coach_applications` ADD `timezone` varchar(100);--> statement-breakpoint
ALTER TABLE `coach_applications` ADD `education` varchar(200);--> statement-breakpoint
ALTER TABLE `coach_applications` ADD `certifications` text;--> statement-breakpoint
ALTER TABLE `coach_applications` ADD `nativeLanguage` varchar(50);--> statement-breakpoint
ALTER TABLE `coach_applications` ADD `teachingLanguage` varchar(50);--> statement-breakpoint
ALTER TABLE `coach_applications` ADD `hasSleExperience` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `coach_applications` ADD `specializations` json;--> statement-breakpoint
ALTER TABLE `coach_applications` ADD `hourlyRate` int;--> statement-breakpoint
ALTER TABLE `coach_applications` ADD `trialRate` int;--> statement-breakpoint
ALTER TABLE `coach_applications` ADD `weeklyHours` int;--> statement-breakpoint
ALTER TABLE `coach_applications` ADD `headline` varchar(200);--> statement-breakpoint
ALTER TABLE `coach_applications` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `coach_applications` ADD `teachingPhilosophy` text;--> statement-breakpoint
ALTER TABLE `coach_applications` ADD `photoUrl` text;--> statement-breakpoint
ALTER TABLE `coach_applications` ADD `termsAccepted` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `coach_applications` ADD `privacyAccepted` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `coach_applications` ADD `backgroundCheckConsent` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `coach_applications` ADD `codeOfConductAccepted` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `coach_applications` ADD `commissionAccepted` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `coach_applications` ADD `digitalSignature` varchar(200);