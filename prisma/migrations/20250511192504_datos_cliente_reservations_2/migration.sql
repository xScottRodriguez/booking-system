/*
  Warnings:

  - You are about to drop the column `client` on the `reservation` table. All the data in the column will be lost.
  - You are about to drop the column `client_phone` on the `reservation` table. All the data in the column will be lost.
  - Added the required column `client_id` to the `reservation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "reservation" DROP COLUMN "client",
DROP COLUMN "client_phone",
ADD COLUMN     "client_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "fk_reservation_client" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
