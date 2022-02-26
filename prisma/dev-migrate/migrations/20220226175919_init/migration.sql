/*
  Warnings:

  - You are about to alter the column `stamp_create` on the `error` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `stamp_create` on the `event` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `stamp_update` on the `event` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `stamp_create` on the `file` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `stamp_create` on the `reception` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `stamp_create` on the `session` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `last_online` on the `session` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `stamp_create` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to alter the column `last_online` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.

*/
-- DropForeignKey
ALTER TABLE `telegram` DROP FOREIGN KEY `telegram_id_fkey`;

-- AlterTable
ALTER TABLE `error` MODIFY `stamp_create` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `event` MODIFY `stamp_create` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `stamp_update` TIMESTAMP NOT NULL;

-- AlterTable
ALTER TABLE `file` MODIFY `stamp_create` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `reception` MODIFY `stamp_create` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `session` MODIFY `stamp_create` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `last_online` TIMESTAMP NOT NULL;

-- AlterTable
ALTER TABLE `telegram` ADD COLUMN `is_active` ENUM('yes', 'no') NOT NULL DEFAULT 'yes',
    ADD COLUMN `stamp_create` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `id` INTEGER NULL,
    MODIFY `telegram_id` INTEGER NULL,
    ADD PRIMARY KEY (`username`);

-- AlterTable
ALTER TABLE `user` MODIFY `stamp_create` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `last_online` TIMESTAMP NOT NULL;

-- AddForeignKey
ALTER TABLE `telegram` ADD CONSTRAINT `telegram_id_fkey` FOREIGN KEY (`id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
