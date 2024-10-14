/*
  Warnings:

  - You are about to drop the `ServiceImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ServiceImage" DROP CONSTRAINT "ServiceImage_serviceId_fkey";

-- DropTable
DROP TABLE "ServiceImage";

-- CreateTable
CREATE TABLE "BarbershopImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "barbershopId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BarbershopImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BarbershopImage" ADD CONSTRAINT "BarbershopImage_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "Barbershop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
