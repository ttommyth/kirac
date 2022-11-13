/*
  Warnings:

  - You are about to drop the `Test` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Test";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "League" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "realm" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "startAt" DATETIME NOT NULL,
    "endAt" DATETIME,
    "description" TEXT NOT NULL,
    "registerAt" DATETIME NOT NULL,
    "delveEvent" BOOLEAN,
    "event" BOOLEAN,
    "shortName" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "League_id_key" ON "League"("id");
