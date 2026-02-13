CREATE TABLE `activity_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`activityType` enum('lesson_started','lesson_completed','slot_completed','quiz_completed','badge_earned','streak_milestone','path_enrolled','path_completed','login') NOT NULL,
	`programId` varchar(16),
	`pathId` varchar(64),
	`lessonId` varchar(16),
	`metadata` json,
	`xpEarned` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookmarks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`itemType` enum('lesson','note','vocabulary','discussion','flashcard_deck') NOT NULL,
	`itemId` int NOT NULL,
	`itemTitle` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bookmarks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `celebration_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`eventType` enum('level_up','badge_earned','challenge_completed','streak_milestone','path_completed','perfect_quiz','first_lesson') NOT NULL,
	`metadata` json,
	`seen` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `celebration_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `certificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('path_completion','level_achievement','challenge_winner') NOT NULL DEFAULT 'path_completion',
	`title` varchar(512) NOT NULL,
	`titleFr` varchar(512),
	`description` text,
	`descriptionFr` text,
	`pathId` varchar(64),
	`cefrLevel` enum('A1','A2','B1','B2','C1'),
	`issuedAt` timestamp NOT NULL DEFAULT (now()),
	`certificateUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `certificates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `challenge_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`challengeId` int NOT NULL,
	`currentValue` int NOT NULL DEFAULT 0,
	`isCompleted` boolean NOT NULL DEFAULT false,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `challenge_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coach_applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fullName` varchar(200) NOT NULL,
	`email` varchar(300) NOT NULL,
	`phone` varchar(50),
	`experience` text,
	`qualifications` text,
	`motivation` text,
	`status` enum('pending','approved','rejected','withdrawn') NOT NULL DEFAULT 'pending',
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`reviewNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coach_applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coach_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`coachId` int NOT NULL,
	`studentId` int NOT NULL,
	`status` enum('active','paused','completed') NOT NULL DEFAULT 'active',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coach_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coach_payouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`coachId` int NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'CAD',
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`sessionsCount` int DEFAULT 0,
	`commissionRate` int DEFAULT 0,
	`processedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coach_payouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coach_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`displayName` varchar(200) NOT NULL,
	`bio` text,
	`specializations` text,
	`languages` text,
	`certifications` text,
	`hourlyRate` int DEFAULT 0,
	`status` enum('pending','active','suspended','inactive') NOT NULL DEFAULT 'pending',
	`averageRating` int DEFAULT 0,
	`totalSessions` int DEFAULT 0,
	`totalStudents` int DEFAULT 0,
	`suspendedAt` timestamp,
	`suspendedReason` text,
	`activatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coach_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `commission_tiers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`commissionRate` int NOT NULL,
	`minStudents` int DEFAULT 0,
	`maxStudents` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `commission_tiers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `content_calendar` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentItemId` int,
	`title` varchar(500) NOT NULL,
	`scheduledDate` timestamp NOT NULL,
	`contentType` enum('lesson','quiz','article','video','podcast','exercise') NOT NULL DEFAULT 'lesson',
	`status` enum('scheduled','published','cancelled') NOT NULL DEFAULT 'scheduled',
	`assignedTo` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `content_calendar_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `content_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`titleFr` varchar(500),
	`contentType` enum('lesson','quiz','article','video','podcast','exercise') NOT NULL DEFAULT 'lesson',
	`status` enum('draft','review','approved','published','archived') NOT NULL DEFAULT 'draft',
	`authorId` int,
	`reviewerId` int,
	`qualityScore` int,
	`scheduledPublishAt` timestamp,
	`publishedAt` timestamp,
	`body` text,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `content_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `content_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`nameFr` varchar(200),
	`category` enum('sle_prep','grammar','vocabulary','reading','listening','speaking','writing') NOT NULL DEFAULT 'sle_prep',
	`description` text,
	`structure` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`usageCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `content_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `daily_study_goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`xpTarget` int NOT NULL DEFAULT 50,
	`xpEarned` int NOT NULL DEFAULT 0,
	`lessonsTarget` int NOT NULL DEFAULT 1,
	`lessonsCompleted` int NOT NULL DEFAULT 0,
	`studyMinutesTarget` int NOT NULL DEFAULT 30,
	`studyMinutesActual` int NOT NULL DEFAULT 0,
	`isGoalMet` boolean NOT NULL DEFAULT false,
	`streakMultiplier` int NOT NULL DEFAULT 100,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `daily_study_goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dictation_exercises` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`cefrLevel` enum('A1','A2','B1','B2','C1') NOT NULL DEFAULT 'B1',
	`totalSentences` int NOT NULL,
	`correctSentences` int,
	`accuracy` int,
	`timeSpentSeconds` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dictation_exercises_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `discussion_replies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`threadId` int NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`parentReplyId` int,
	`likeCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `discussion_replies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `discussion_threads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(512) NOT NULL,
	`content` text NOT NULL,
	`category` enum('grammar','vocabulary','sle_prep','general','study_tips','resources') NOT NULL DEFAULT 'general',
	`isPinned` boolean NOT NULL DEFAULT false,
	`isLocked` boolean NOT NULL DEFAULT false,
	`replyCount` int NOT NULL DEFAULT 0,
	`likeCount` int NOT NULL DEFAULT 0,
	`viewCount` int NOT NULL DEFAULT 0,
	`lastReplyAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `discussion_threads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `flashcard_decks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(256) NOT NULL,
	`description` text,
	`programId` varchar(16),
	`pathId` varchar(64),
	`cardCount` int NOT NULL DEFAULT 0,
	`color` varchar(16) NOT NULL DEFAULT 'teal',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `flashcard_decks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `flashcards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`deckId` int NOT NULL,
	`front` text NOT NULL,
	`back` text NOT NULL,
	`hint` text,
	`easeFactor` int NOT NULL DEFAULT 250,
	`interval_days` int NOT NULL DEFAULT 0,
	`repetitions` int NOT NULL DEFAULT 0,
	`nextReviewDate` varchar(10),
	`lastReviewDate` varchar(10),
	`status` enum('new','learning','review','mastered') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `flashcards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gamification_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalXp` int NOT NULL DEFAULT 0,
	`level` int NOT NULL DEFAULT 1,
	`currentStreak` int NOT NULL DEFAULT 0,
	`longestStreak` int NOT NULL DEFAULT 0,
	`lastActivityDate` varchar(10),
	`lessonsCompleted` int NOT NULL DEFAULT 0,
	`quizzesCompleted` int NOT NULL DEFAULT 0,
	`perfectQuizzes` int NOT NULL DEFAULT 0,
	`totalStudyTimeMinutes` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gamification_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `grammar_drills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`topic` varchar(256) NOT NULL,
	`cefrLevel` enum('A1','A2','B1','B2','C1') NOT NULL,
	`drillType` enum('fill_blank','conjugation','reorder','multiple_choice') NOT NULL DEFAULT 'fill_blank',
	`score` int,
	`totalQuestions` int NOT NULL DEFAULT 10,
	`correctAnswers` int NOT NULL DEFAULT 0,
	`timeSpentSeconds` int,
	`language` enum('en','fr') NOT NULL DEFAULT 'fr',
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `grammar_drills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lesson_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`programId` varchar(16) NOT NULL,
	`pathId` varchar(64) NOT NULL,
	`moduleIndex` int NOT NULL,
	`lessonId` varchar(16) NOT NULL,
	`slotsCompleted` json,
	`isCompleted` boolean NOT NULL DEFAULT false,
	`xpEarned` int NOT NULL DEFAULT 0,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lesson_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `listening_exercises` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`exerciseTitle` varchar(512) NOT NULL,
	`cefrLevel` enum('A1','A2','B1','B2','C1') NOT NULL,
	`score` int,
	`totalQuestions` int NOT NULL DEFAULT 5,
	`correctAnswers` int NOT NULL DEFAULT 0,
	`timeSpentSeconds` int,
	`language` enum('en','fr') NOT NULL DEFAULT 'fr',
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `listening_exercises_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mock_sle_exams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`examType` enum('reading','writing','oral') NOT NULL,
	`cefrLevel` enum('A1','A2','B1','B2','C1') NOT NULL DEFAULT 'B1',
	`totalQuestions` int NOT NULL,
	`correctAnswers` int,
	`score` int,
	`timeLimitSeconds` int NOT NULL,
	`timeUsedSeconds` int,
	`status` enum('in_progress','completed','expired') NOT NULL DEFAULT 'in_progress',
	`answers` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `mock_sle_exams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`message` text NOT NULL,
	`type` enum('info','achievement','reminder','system') NOT NULL DEFAULT 'info',
	`isRead` boolean NOT NULL DEFAULT false,
	`link` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `onboarding_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`currentLevel` enum('A1','A2','B1','B2','C1') NOT NULL DEFAULT 'A1',
	`targetLevel` enum('A1','A2','B1','B2','C1') NOT NULL DEFAULT 'B2',
	`learningGoal` enum('sle_prep','conversation','professional','academic','travel') NOT NULL DEFAULT 'sle_prep',
	`weeklyHours` int NOT NULL DEFAULT 5,
	`preferredTime` enum('morning','afternoon','evening') NOT NULL DEFAULT 'morning',
	`completedOnboarding` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `onboarding_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `path_enrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`programId` varchar(16) NOT NULL,
	`pathId` varchar(64) NOT NULL,
	`status` enum('enrolled','in_progress','completed') NOT NULL DEFAULT 'enrolled',
	`progressPercent` int NOT NULL DEFAULT 0,
	`enrolledAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `path_enrollments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `peer_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`submissionId` int NOT NULL,
	`reviewerId` int NOT NULL,
	`authorId` int NOT NULL,
	`grammarScore` int,
	`vocabularyScore` int,
	`coherenceScore` int,
	`overallScore` int,
	`feedback` text,
	`strengths` text,
	`improvements` text,
	`status` enum('pending','completed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `peer_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`programId` varchar(16) NOT NULL,
	`pathId` varchar(64) NOT NULL,
	`lessonId` varchar(16),
	`quizType` enum('formative','summative','final_exam') NOT NULL,
	`totalQuestions` int NOT NULL,
	`correctAnswers` int NOT NULL,
	`score` int NOT NULL,
	`answers` json,
	`xpEarned` int NOT NULL DEFAULT 0,
	`isPerfect` boolean NOT NULL DEFAULT false,
	`attemptNumber` int NOT NULL DEFAULT 1,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quiz_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reading_exercises` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`passageTitle` varchar(512) NOT NULL,
	`cefrLevel` enum('A1','A2','B1','B2','C1') NOT NULL,
	`wordsPerMinute` int,
	`score` int,
	`totalQuestions` int NOT NULL DEFAULT 5,
	`correctAnswers` int NOT NULL DEFAULT 0,
	`timeSpentSeconds` int,
	`language` enum('en','fr') NOT NULL DEFAULT 'fr',
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reading_exercises_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `study_group_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`groupId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('member','admin') NOT NULL DEFAULT 'member',
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `study_group_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `study_groups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`creatorId` int NOT NULL,
	`maxMembers` int NOT NULL DEFAULT 10,
	`cefrLevel` enum('A1','A2','B1','B2','C1') NOT NULL DEFAULT 'B1',
	`isPublic` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `study_groups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `study_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`content` text NOT NULL,
	`tags` json,
	`programId` varchar(16),
	`pathId` varchar(64),
	`lessonId` varchar(16),
	`isPinned` boolean NOT NULL DEFAULT false,
	`color` varchar(16) NOT NULL DEFAULT 'default',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `study_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `study_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text,
	`sessionType` enum('lesson','quiz','sle_practice','flashcard_review','tutoring','custom') NOT NULL DEFAULT 'custom',
	`scheduledDate` varchar(10) NOT NULL,
	`scheduledTime` varchar(5),
	`durationMinutes` int NOT NULL DEFAULT 30,
	`isCompleted` boolean NOT NULL DEFAULT false,
	`programId` varchar(16),
	`pathId` varchar(64),
	`lessonId` varchar(16),
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `study_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`badgeId` varchar(64) NOT NULL,
	`badgeName` varchar(128) NOT NULL,
	`badgeDescription` text,
	`badgeIcon` varchar(32) NOT NULL,
	`badgeColor` varchar(16) NOT NULL,
	`xpReward` int NOT NULL DEFAULT 0,
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_badges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`preferredLanguage` enum('en','fr') NOT NULL DEFAULT 'en',
	`avatarUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `vocabulary_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`word` varchar(256) NOT NULL,
	`translation` varchar(256) NOT NULL,
	`definition` text,
	`exampleSentence` text,
	`pronunciation` varchar(256),
	`partOfSpeech` varchar(32),
	`programId` varchar(16),
	`pathId` varchar(64),
	`lessonId` varchar(16),
	`mastery` enum('new','learning','familiar','mastered') NOT NULL DEFAULT 'new',
	`reviewCount` int NOT NULL DEFAULT 0,
	`correctCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vocabulary_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weekly_challenges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`titleFr` varchar(256) NOT NULL,
	`description` text NOT NULL,
	`descriptionFr` text NOT NULL,
	`challengeType` enum('complete_lessons','earn_xp','perfect_quizzes','maintain_streak','complete_slots','study_time') NOT NULL,
	`targetValue` int NOT NULL,
	`xpReward` int NOT NULL DEFAULT 200,
	`badgeReward` varchar(64),
	`weekStartDate` varchar(10) NOT NULL,
	`weekEndDate` varchar(10) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weekly_challenges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `writing_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(512) NOT NULL,
	`content` text NOT NULL,
	`promptText` text,
	`language` enum('en','fr') NOT NULL DEFAULT 'fr',
	`cefrLevel` enum('A1','A2','B1','B2','C1'),
	`status` enum('draft','submitted','reviewed') NOT NULL DEFAULT 'draft',
	`wordCount` int NOT NULL DEFAULT 0,
	`aiFeedback` text,
	`aiScore` int,
	`programId` varchar(16),
	`pathId` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `writing_submissions_id` PRIMARY KEY(`id`)
);
