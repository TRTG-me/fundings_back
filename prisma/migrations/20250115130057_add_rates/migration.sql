/*
  Warnings:

  - You are about to drop the `PENDLE` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "PENDLE";

-- CreateTable
CREATE TABLE "fundings" (
    "id" SERIAL NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "date" TEXT NOT NULL,

    CONSTRAINT "fundings_pkey" PRIMARY KEY ("id")
);
