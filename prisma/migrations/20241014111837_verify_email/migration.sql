-- DropIndex
DROP INDEX "Customer_barbershopId_idx";

-- DropIndex
DROP INDEX "Customer_userId_barbershopId_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false;
