/*
  Warnings:

  - The primary key for the `block_tracker` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `lastBlock` on the `block_tracker` table. All the data in the column will be lost.
  - You are about to drop the column `lastUpdated` on the `block_tracker` table. All the data in the column will be lost.
  - You are about to drop the column `serviceName` on the `block_tracker` table. All the data in the column will be lost.
  - Added the required column `last_block` to the `block_tracker` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."block_tracker" DROP CONSTRAINT "block_tracker_pkey",
DROP COLUMN "lastBlock",
DROP COLUMN "lastUpdated",
DROP COLUMN "serviceName",
ADD COLUMN     "last_block" BIGINT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "block_tracker_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "block_tracker_id_seq";
