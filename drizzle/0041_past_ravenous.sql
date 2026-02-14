CREATE TABLE `coach_nudges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`message` text NOT NULL,
	`messageFr` text,
	`triggerType` enum('lesson_complete','module_complete','streak_milestone','comeback','slow_progress','quiz_fail','quiz_pass','first_login','weekly_summary','encouragement') NOT NULL,
	`conditions` json,
	`coachName` varchar(100) DEFAULT 'Prof. Steven',
	`coachAvatarUrl` varchar(500),
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coach_nudges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comment_likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`commentId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `comment_likes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `confidence_checks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`lessonId` int NOT NULL,
	`courseId` int NOT NULL,
	`confidenceLevel` int NOT NULL,
	`feedback` text,
	`needsReview` json DEFAULT ('[]'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `confidence_checks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `course_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`lessonId` int,
	`moduleId` int,
	`courseId` int NOT NULL,
	`content` text NOT NULL,
	`parentId` int,
	`isApproved` boolean DEFAULT true,
	`isHidden` boolean DEFAULT false,
	`likesCount` int DEFAULT 0,
	`repliesCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `course_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `downloadable_resources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`titleFr` varchar(200),
	`description` text,
	`descriptionFr` text,
	`fileUrl` varchar(500) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileType` varchar(50) NOT NULL,
	`fileSizeBytes` int,
	`lessonId` int,
	`moduleId` int,
	`courseId` int,
	`requiresEnrollment` boolean DEFAULT true,
	`downloadCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `downloadable_resources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `drip_schedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`moduleId` int,
	`lessonId` int,
	`dripType` enum('days_after_enrollment','fixed_date','after_completion') NOT NULL,
	`daysAfterEnrollment` int,
	`releaseDate` timestamp,
	`prerequisiteModuleId` int,
	`prerequisiteLessonId` int,
	`sendNotification` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `drip_schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exercise_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`exerciseId` int NOT NULL,
	`userAnswer` json,
	`audioUrl` varchar(500),
	`score` int,
	`maxScore` int,
	`isCorrect` boolean,
	`selfRating` int,
	`xpEarned` int DEFAULT 0,
	`timeTakenSeconds` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exercise_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `interactive_exercises` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lessonId` int NOT NULL,
	`courseId` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`titleFr` varchar(200),
	`instructions` text NOT NULL,
	`instructionsFr` text,
	`exerciseType` enum('drag_drop','fill_blanks','multiple_choice','matching','ordering','speaking_prompt','writing_prompt','role_play','scenario_choice','audio_response') NOT NULL,
	`content` json NOT NULL,
	`correctAnswer` json,
	`modelAnswer` text,
	`modelAnswerFr` text,
	`maxPoints` int DEFAULT 10,
	`xpReward` int DEFAULT 5,
	`timeLimitSeconds` int,
	`rubric` json,
	`orderIndex` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `interactive_exercises_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learner_badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`badgeType` enum('first_lesson','module_complete','course_complete','all_courses_complete','streak_3','streak_7','streak_14','streak_30','streak_100','quiz_ace','perfect_module','quiz_master','early_bird','night_owl','weekend_warrior','consistent_learner','xp_100','xp_500','xp_1000','xp_5000','founding_member','beta_tester','community_helper','top_reviewer') NOT NULL,
	`title` varchar(100) NOT NULL,
	`titleFr` varchar(100),
	`description` varchar(255),
	`descriptionFr` varchar(255),
	`iconUrl` varchar(500),
	`courseId` int,
	`moduleId` int,
	`metadata` json,
	`awardedAt` timestamp NOT NULL DEFAULT (now()),
	`isNew` boolean DEFAULT true,
	CONSTRAINT `learner_badges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learner_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`lessonId` int NOT NULL,
	`courseId` int NOT NULL,
	`content` text NOT NULL,
	`highlightText` text,
	`highlightPosition` json,
	`tags` json DEFAULT ('[]'),
	`isPinned` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `learner_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learner_xp` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalXp` int NOT NULL DEFAULT 0,
	`weeklyXp` int NOT NULL DEFAULT 0,
	`monthlyXp` int NOT NULL DEFAULT 0,
	`currentLevel` int NOT NULL DEFAULT 1,
	`levelTitle` varchar(50) NOT NULL DEFAULT 'Beginner',
	`currentStreak` int NOT NULL DEFAULT 0,
	`longestStreak` int NOT NULL DEFAULT 0,
	`lastActivityDate` timestamp,
	`streakFreezeAvailable` boolean DEFAULT true,
	`milestonesReached` json DEFAULT ('[]'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `learner_xp_id` PRIMARY KEY(`id`),
	CONSTRAINT `learner_xp_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `live_room_registrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`roomId` int NOT NULL,
	`attended` boolean DEFAULT false,
	`joinedAt` timestamp,
	`leftAt` timestamp,
	`xpAwarded` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `live_room_registrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `live_rooms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`titleFr` varchar(200),
	`description` text,
	`descriptionFr` text,
	`courseId` int,
	`moduleId` int,
	`hostId` int NOT NULL,
	`scheduledAt` timestamp NOT NULL,
	`durationMinutes` int DEFAULT 60,
	`meetingUrl` varchar(500),
	`meetingProvider` enum('zoom','google_meet','teams','internal') DEFAULT 'zoom',
	`recordingUrl` varchar(500),
	`maxParticipants` int DEFAULT 50,
	`currentParticipants` int DEFAULT 0,
	`status` enum('scheduled','live','completed','cancelled') DEFAULT 'scheduled',
	`attendanceXp` int DEFAULT 50,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `live_rooms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `practice_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`practiceType` enum('oral_practice','writing_practice','reading_practice','listening_practice','vocabulary_drill','grammar_exercise','speaking_prompt','role_play') NOT NULL,
	`durationSeconds` int NOT NULL,
	`lessonId` int,
	`courseId` int,
	`selfRating` int,
	`notes` text,
	`xpEarned` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `practice_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `resource_downloads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`resourceId` int NOT NULL,
	`downloadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `resource_downloads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_content_access` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`enrollmentId` int NOT NULL,
	`moduleId` int,
	`lessonId` int,
	`unlockedAt` timestamp NOT NULL DEFAULT (now()),
	`unlockedBy` enum('enrollment','drip','admin','purchase') DEFAULT 'enrollment',
	`notificationSent` boolean DEFAULT false,
	CONSTRAINT `user_content_access_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_nudge_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nudgeId` int NOT NULL,
	`shownAt` timestamp NOT NULL DEFAULT (now()),
	`dismissed` boolean DEFAULT false,
	`clickedAction` boolean DEFAULT false,
	CONSTRAINT `user_nudge_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_weekly_challenges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`challengeId` int NOT NULL,
	`currentProgress` int NOT NULL DEFAULT 0,
	`status` enum('active','completed','expired') NOT NULL DEFAULT 'active',
	`completedAt` timestamp,
	`xpAwarded` int,
	`badgeAwarded` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_weekly_challenges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weekly_challenges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`titleFr` varchar(200),
	`description` text NOT NULL,
	`descriptionFr` text,
	`challengeType` enum('oral_challenge','writing_prompt','reading_challenge','vocabulary_sprint','grammar_gauntlet','conversation_practice') NOT NULL,
	`targetCount` int NOT NULL,
	`targetUnit` varchar(50) NOT NULL,
	`xpReward` int NOT NULL,
	`badgeReward` varchar(50),
	`weekStart` timestamp NOT NULL,
	`weekEnd` timestamp NOT NULL,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weekly_challenges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `xp_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`reason` enum('lesson_complete','quiz_pass','quiz_perfect','module_complete','course_complete','streak_bonus','daily_login','first_lesson','challenge_complete','review_submitted','note_created','exercise_complete','speaking_practice','writing_submitted','milestone_bonus','level_up_bonus','referral_bonus') NOT NULL,
	`description` varchar(255),
	`referenceType` varchar(50),
	`referenceId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `xp_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `comment_likes` ADD CONSTRAINT `comment_likes_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comment_likes` ADD CONSTRAINT `comment_likes_commentId_course_comments_id_fk` FOREIGN KEY (`commentId`) REFERENCES `course_comments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `confidence_checks` ADD CONSTRAINT `confidence_checks_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `confidence_checks` ADD CONSTRAINT `confidence_checks_lessonId_lessons_id_fk` FOREIGN KEY (`lessonId`) REFERENCES `lessons`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `confidence_checks` ADD CONSTRAINT `confidence_checks_courseId_courses_id_fk` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_comments` ADD CONSTRAINT `course_comments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_comments` ADD CONSTRAINT `course_comments_lessonId_lessons_id_fk` FOREIGN KEY (`lessonId`) REFERENCES `lessons`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_comments` ADD CONSTRAINT `course_comments_moduleId_course_modules_id_fk` FOREIGN KEY (`moduleId`) REFERENCES `course_modules`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_comments` ADD CONSTRAINT `course_comments_courseId_courses_id_fk` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `downloadable_resources` ADD CONSTRAINT `downloadable_resources_lessonId_lessons_id_fk` FOREIGN KEY (`lessonId`) REFERENCES `lessons`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `downloadable_resources` ADD CONSTRAINT `downloadable_resources_moduleId_course_modules_id_fk` FOREIGN KEY (`moduleId`) REFERENCES `course_modules`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `downloadable_resources` ADD CONSTRAINT `downloadable_resources_courseId_courses_id_fk` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `drip_schedules` ADD CONSTRAINT `drip_schedules_courseId_courses_id_fk` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `drip_schedules` ADD CONSTRAINT `drip_schedules_moduleId_course_modules_id_fk` FOREIGN KEY (`moduleId`) REFERENCES `course_modules`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `drip_schedules` ADD CONSTRAINT `drip_schedules_lessonId_lessons_id_fk` FOREIGN KEY (`lessonId`) REFERENCES `lessons`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `drip_schedules` ADD CONSTRAINT `drip_schedules_prerequisiteModuleId_course_modules_id_fk` FOREIGN KEY (`prerequisiteModuleId`) REFERENCES `course_modules`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `drip_schedules` ADD CONSTRAINT `drip_schedules_prerequisiteLessonId_lessons_id_fk` FOREIGN KEY (`prerequisiteLessonId`) REFERENCES `lessons`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `exercise_attempts` ADD CONSTRAINT `exercise_attempts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `exercise_attempts` ADD CONSTRAINT `exercise_attempts_exerciseId_interactive_exercises_id_fk` FOREIGN KEY (`exerciseId`) REFERENCES `interactive_exercises`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `interactive_exercises` ADD CONSTRAINT `interactive_exercises_lessonId_lessons_id_fk` FOREIGN KEY (`lessonId`) REFERENCES `lessons`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `interactive_exercises` ADD CONSTRAINT `interactive_exercises_courseId_courses_id_fk` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `learner_badges` ADD CONSTRAINT `learner_badges_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `learner_badges` ADD CONSTRAINT `learner_badges_courseId_courses_id_fk` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `learner_badges` ADD CONSTRAINT `learner_badges_moduleId_course_modules_id_fk` FOREIGN KEY (`moduleId`) REFERENCES `course_modules`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `learner_notes` ADD CONSTRAINT `learner_notes_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `learner_notes` ADD CONSTRAINT `learner_notes_lessonId_lessons_id_fk` FOREIGN KEY (`lessonId`) REFERENCES `lessons`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `learner_notes` ADD CONSTRAINT `learner_notes_courseId_courses_id_fk` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `learner_xp` ADD CONSTRAINT `learner_xp_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `live_room_registrations` ADD CONSTRAINT `live_room_registrations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `live_room_registrations` ADD CONSTRAINT `live_room_registrations_roomId_live_rooms_id_fk` FOREIGN KEY (`roomId`) REFERENCES `live_rooms`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `live_rooms` ADD CONSTRAINT `live_rooms_courseId_courses_id_fk` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `live_rooms` ADD CONSTRAINT `live_rooms_moduleId_course_modules_id_fk` FOREIGN KEY (`moduleId`) REFERENCES `course_modules`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `live_rooms` ADD CONSTRAINT `live_rooms_hostId_users_id_fk` FOREIGN KEY (`hostId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `practice_logs` ADD CONSTRAINT `practice_logs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `practice_logs` ADD CONSTRAINT `practice_logs_lessonId_lessons_id_fk` FOREIGN KEY (`lessonId`) REFERENCES `lessons`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `practice_logs` ADD CONSTRAINT `practice_logs_courseId_courses_id_fk` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `resource_downloads` ADD CONSTRAINT `resource_downloads_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `resource_downloads` ADD CONSTRAINT `resource_downloads_resourceId_downloadable_resources_id_fk` FOREIGN KEY (`resourceId`) REFERENCES `downloadable_resources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_content_access` ADD CONSTRAINT `user_content_access_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_content_access` ADD CONSTRAINT `user_content_access_enrollmentId_course_enrollments_id_fk` FOREIGN KEY (`enrollmentId`) REFERENCES `course_enrollments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_content_access` ADD CONSTRAINT `user_content_access_moduleId_course_modules_id_fk` FOREIGN KEY (`moduleId`) REFERENCES `course_modules`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_content_access` ADD CONSTRAINT `user_content_access_lessonId_lessons_id_fk` FOREIGN KEY (`lessonId`) REFERENCES `lessons`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_nudge_history` ADD CONSTRAINT `user_nudge_history_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_nudge_history` ADD CONSTRAINT `user_nudge_history_nudgeId_coach_nudges_id_fk` FOREIGN KEY (`nudgeId`) REFERENCES `coach_nudges`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_weekly_challenges` ADD CONSTRAINT `user_weekly_challenges_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_weekly_challenges` ADD CONSTRAINT `user_weekly_challenges_challengeId_weekly_challenges_id_fk` FOREIGN KEY (`challengeId`) REFERENCES `weekly_challenges`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `xp_transactions` ADD CONSTRAINT `xp_transactions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;