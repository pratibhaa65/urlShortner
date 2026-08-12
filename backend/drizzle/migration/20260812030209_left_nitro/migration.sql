CREATE TABLE `users` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	CONSTRAINT `email_unique` UNIQUE INDEX(`email`)
);
--> statement-breakpoint
ALTER TABLE `shortLinks` ADD `user_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `shortLinks` ADD `created_at` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `shortLinks` ADD CONSTRAINT `shortLinks_user_id_users_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`);