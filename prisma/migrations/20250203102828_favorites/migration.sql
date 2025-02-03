-- CreateTable
CREATE TABLE "fundingsTest" (
    "id" SERIAL NOT NULL,
    "coin" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "date" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "fundingsTest_pkey" PRIMARY KEY ("id")
);
