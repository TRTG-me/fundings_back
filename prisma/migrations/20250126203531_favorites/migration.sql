/*
  Warnings:

  - A unique constraint covering the columns `[coin]` on the table `favorites` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "favorites_coin_key" ON "favorites"("coin");
