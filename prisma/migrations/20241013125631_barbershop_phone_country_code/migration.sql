/*
  Warnings:

  - You are about to drop the column `phone` on the `Barbershop` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Barbershop" DROP COLUMN "phone",
ADD COLUMN     "countryCode" TEXT,
ADD COLUMN     "phoneNumber" TEXT;
