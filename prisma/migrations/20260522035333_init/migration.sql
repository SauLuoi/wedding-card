-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WeddingConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "brideName" TEXT NOT NULL,
    "brideShortName" TEXT NOT NULL,
    "groomName" TEXT NOT NULL,
    "groomShortName" TEXT NOT NULL,
    "weddingDate" DATETIME NOT NULL,
    "locationName" TEXT NOT NULL,
    "locationAddress" TEXT NOT NULL,
    "googleMapsEmbedUrl" TEXT NOT NULL,
    "googleMapsDirectionUrl" TEXT NOT NULL,
    "musicUrl" TEXT NOT NULL DEFAULT '',
    "themeColor" TEXT NOT NULL DEFAULT '#d4af37',
    "fontFamily" TEXT NOT NULL DEFAULT 'Playfair Display',
    "seoTitle" TEXT NOT NULL,
    "seoDescription" TEXT NOT NULL,
    "seoImage" TEXT NOT NULL DEFAULT '',
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "heroImage" TEXT NOT NULL DEFAULT '',
    "aboutTitle" TEXT NOT NULL DEFAULT 'Love Story',
    "aboutText" TEXT NOT NULL DEFAULT 'We are excited to share our story with you...',
    "brideAbout" TEXT NOT NULL DEFAULT '',
    "groomAbout" TEXT NOT NULL DEFAULT '',
    "brideImage" TEXT NOT NULL DEFAULT '',
    "groomImage" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StoryTimeline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weddingConfigId" TEXT NOT NULL,
    "dateString" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StoryTimeline_weddingConfigId_fkey" FOREIGN KEY ("weddingConfigId") REFERENCES "WeddingConfig" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GalleryImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weddingConfigId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GalleryImage_weddingConfigId_fkey" FOREIGN KEY ("weddingConfigId") REFERENCES "WeddingConfig" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RSVP" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weddingConfigId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "guestsCount" INTEGER NOT NULL DEFAULT 1,
    "wishes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RSVP_weddingConfigId_fkey" FOREIGN KEY ("weddingConfigId") REFERENCES "WeddingConfig" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Wish" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weddingConfigId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Wish_weddingConfigId_fkey" FOREIGN KEY ("weddingConfigId") REFERENCES "WeddingConfig" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "WeddingConfig_slug_key" ON "WeddingConfig"("slug");
