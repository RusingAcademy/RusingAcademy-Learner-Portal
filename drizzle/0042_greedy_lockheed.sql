ALTER TABLE `confidence_checks` MODIFY COLUMN `needsReview` json;--> statement-breakpoint
ALTER TABLE `learner_notes` MODIFY COLUMN `tags` json;--> statement-breakpoint
ALTER TABLE `learner_xp` MODIFY COLUMN `milestonesReached` json;