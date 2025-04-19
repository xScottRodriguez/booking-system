/*
  Warnings:

  - Made the column `scheduled_time` on table `reservation` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "reservation" ALTER COLUMN "reservation_date" SET DATA TYPE TEXT,
ALTER COLUMN "scheduled_time" SET NOT NULL,
ALTER COLUMN "scheduled_time" SET DATA TYPE TEXT;
