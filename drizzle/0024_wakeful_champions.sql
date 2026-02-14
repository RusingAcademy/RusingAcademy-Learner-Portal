ALTER TABLE `application_comments` DROP FOREIGN KEY `application_comments_parentCommentId_application_comments_id_fk`;
--> statement-breakpoint
ALTER TABLE `admin_performance_metrics` MODIFY COLUMN `averageReviewTimeHours` decimal(8,2) DEFAULT '0';