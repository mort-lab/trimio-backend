-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "customerId" TEXT;

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "barbershopId" TEXT NOT NULL,
    "firstVisitDate" TIMESTAMP(3),
    "lastVisitDate" TIMESTAMP(3),
    "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "averageRating" DOUBLE PRECISION,
    "appointmentCount" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Customer_barbershopId_idx" ON "Customer"("barbershopId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_userId_barbershopId_key" ON "Customer"("userId", "barbershopId");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "Barbershop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
