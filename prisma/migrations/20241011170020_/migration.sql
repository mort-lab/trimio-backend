/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Service` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Service_barbershopId_idx";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "imageUrl";

-- CreateTable
CREATE TABLE "ServiceImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ServiceImage" ADD CONSTRAINT "ServiceImage_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
