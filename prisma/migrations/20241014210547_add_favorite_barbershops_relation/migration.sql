-- CreateTable
CREATE TABLE "FavoriteBarbershop" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "barbershopId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteBarbershop_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteBarbershop_userId_barbershopId_key" ON "FavoriteBarbershop"("userId", "barbershopId");

-- AddForeignKey
ALTER TABLE "FavoriteBarbershop" ADD CONSTRAINT "FavoriteBarbershop_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteBarbershop" ADD CONSTRAINT "FavoriteBarbershop_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "Barbershop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
