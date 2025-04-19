/*
  Warnings:

  - You are about to drop the column `client_id` on the `reservation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "reservation" DROP CONSTRAINT "fk_reservation_client";

-- AlterTable
ALTER TABLE "reservation" DROP COLUMN "client_id",
ADD COLUMN     "client" TEXT,
ADD COLUMN     "client_phone" TEXT;
