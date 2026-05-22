/*
  Warnings:

  - You are about to drop the `RSVP` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "RSVP";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Rsvp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weddingConfigId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "guestsCount" INTEGER NOT NULL DEFAULT 1,
    "wishes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Rsvp_weddingConfigId_fkey" FOREIGN KEY ("weddingConfigId") REFERENCES "WeddingConfig" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
