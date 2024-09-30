/*
  Warnings:

  - You are about to drop the column `barberId` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `Barbershop` table. All the data in the column will be lost.
  - You are about to drop the column `barberId` on the `Statistic` table. All the data in the column will be lost.
  - You are about to drop the `Barber` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `barberProfileId` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `barberProfileId` to the `Statistic` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BarberRole" AS ENUM ('OWNER', 'BARBER');

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_barberId_fkey";

-- DropForeignKey
ALTER TABLE "Barber" DROP CONSTRAINT "Barber_barbershopId_fkey";

-- DropForeignKey
ALTER TABLE "Barber" DROP CONSTRAINT "Barber_userId_fkey";

-- DropForeignKey
ALTER TABLE "Barbershop" DROP CONSTRAINT "Barbershop_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Statistic" DROP CONSTRAINT "Statistic_barberId_fkey";

-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "barberId",
ADD COLUMN     "barberProfileId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Barbershop" DROP COLUMN "ownerId";

-- AlterTable
ALTER TABLE "Statistic" DROP COLUMN "barberId",
ADD COLUMN     "barberProfileId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Barber";

-- CreateTable
CREATE TABLE "BarberProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "barbershopId" TEXT NOT NULL,
    "role" "BarberRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BarberProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BarberProfile_userId_barbershopId_key" ON "BarberProfile"("userId", "barbershopId");

-- AddForeignKey
ALTER TABLE "BarberProfile" ADD CONSTRAINT "BarberProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BarberProfile" ADD CONSTRAINT "BarberProfile_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "Barbershop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_barberProfileId_fkey" FOREIGN KEY ("barberProfileId") REFERENCES "BarberProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Statistic" ADD CONSTRAINT "Statistic_barberProfileId_fkey" FOREIGN KEY ("barberProfileId") REFERENCES "BarberProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
