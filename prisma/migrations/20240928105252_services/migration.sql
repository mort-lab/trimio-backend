/*
  Warnings:

  - You are about to drop the column `barberId` on the `Service` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[appointmentId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `barbershopId` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `barbershopId` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_barberId_fkey";

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "barbershopId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "barberId",
ADD COLUMN     "barbershopId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_appointmentId_key" ON "Payment"("appointmentId");

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "Barbershop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "Barbershop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
