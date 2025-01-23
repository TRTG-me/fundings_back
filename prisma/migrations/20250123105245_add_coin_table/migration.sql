/*
  Warnings:

  - You are about to drop the column `wallet` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `FailedPayment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SuccessPayment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FailedPayment" DROP CONSTRAINT "FailedPayment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_userId_fkey";

-- DropForeignKey
ALTER TABLE "SuccessPayment" DROP CONSTRAINT "SuccessPayment_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "wallet";

-- DropTable
DROP TABLE "FailedPayment";

-- DropTable
DROP TABLE "Payment";

-- DropTable
DROP TABLE "SuccessPayment";

-- CreateTable
CREATE TABLE "coins" (
    "id" SERIAL NOT NULL,
    "bin" TEXT NOT NULL,
    "hype" TEXT NOT NULL,
    "hours" TEXT NOT NULL,

    CONSTRAINT "coins_pkey" PRIMARY KEY ("id")
);
