-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WeddingConfig" (
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
    "groomQrUrl" TEXT NOT NULL DEFAULT '',
    "groomBankName" TEXT NOT NULL DEFAULT '',
    "groomAccountNumber" TEXT NOT NULL DEFAULT '',
    "groomAccountName" TEXT NOT NULL DEFAULT '',
    "brideQrUrl" TEXT NOT NULL DEFAULT '',
    "brideBankName" TEXT NOT NULL DEFAULT '',
    "brideAccountNumber" TEXT NOT NULL DEFAULT '',
    "brideAccountName" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_WeddingConfig" ("aboutText", "aboutTitle", "brideAbout", "brideImage", "brideName", "brideShortName", "createdAt", "fontFamily", "googleMapsDirectionUrl", "googleMapsEmbedUrl", "groomAbout", "groomImage", "groomName", "groomShortName", "heroImage", "id", "locationAddress", "locationName", "musicUrl", "seoDescription", "seoImage", "seoTitle", "slug", "themeColor", "updatedAt", "viewsCount", "weddingDate") SELECT "aboutText", "aboutTitle", "brideAbout", "brideImage", "brideName", "brideShortName", "createdAt", "fontFamily", "googleMapsDirectionUrl", "googleMapsEmbedUrl", "groomAbout", "groomImage", "groomName", "groomShortName", "heroImage", "id", "locationAddress", "locationName", "musicUrl", "seoDescription", "seoImage", "seoTitle", "slug", "themeColor", "updatedAt", "viewsCount", "weddingDate" FROM "WeddingConfig";
DROP TABLE "WeddingConfig";
ALTER TABLE "new_WeddingConfig" RENAME TO "WeddingConfig";
CREATE UNIQUE INDEX "WeddingConfig_slug_key" ON "WeddingConfig"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
