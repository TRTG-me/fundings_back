-- CreateTable
CREATE TABLE "PENDLE" (
    "id" SERIAL NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "date" TEXT NOT NULL,

    CONSTRAINT "PENDLE_pkey" PRIMARY KEY ("id")
);
