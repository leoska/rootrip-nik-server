-- CreateTable
CREATE TABLE `session` (
    `id` VARCHAR(24) NOT NULL,
    `ip_address` VARCHAR(15) NOT NULL,
    `browser` TINYTEXT NOT NULL,
    `os` VARCHAR(30) NOT NULL,
    `resolution_width` INTEGER NOT NULL,
    `resolution_height` INTEGER NOT NULL,
    `orientation` ENUM('portrait', 'landscape') NOT NULL,
    `memory` FLOAT NOT NULL,
    `offset_timezone` INTEGER NOT NULL,
    `stamp_create` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `last_online` TIMESTAMP NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `header_img` TINYTEXT NOT NULL,
    `header` TEXT NOT NULL,
    `description` TEXT NOT NULL,
    `body` TEXT NOT NULL,
    `stamp_create` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `stamp_update` TIMESTAMP NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reception` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` TINYTEXT NOT NULL,
    `phone` TINYTEXT NOT NULL,
    `email` TINYTEXT NOT NULL,
    `category` VARCHAR(70) NOT NULL,
    `body` TEXT NOT NULL,
    `session_id` VARCHAR(24) NOT NULL,
    `nodemailer` TINYTEXT NOT NULL,
    `stamp_create` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `file` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mime_type` VARCHAR(100) NOT NULL,
    `file_path` TINYTEXT NOT NULL,
    `stamp_create` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `error` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `session_id` VARCHAR(24) NOT NULL,
    `message` TINYTEXT NOT NULL,
    `stack` TEXT NOT NULL,
    `stamp_create` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reception` ADD CONSTRAINT `reception_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `session`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `error` ADD CONSTRAINT `error_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `session`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
