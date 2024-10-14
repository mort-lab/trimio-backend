/*
  Warnings:

  - You are about to drop the column `averageRating` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Customer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "averageRating",
DROP COLUMN "notes";
