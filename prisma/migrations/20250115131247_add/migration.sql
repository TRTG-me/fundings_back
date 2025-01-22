/*
  Warnings:

  - Added the required column `coin` to the `fundings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "fundings" ADD COLUMN     "coin" TEXT NOT NULL;
