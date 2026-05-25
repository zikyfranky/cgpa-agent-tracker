-- CreateTable
CREATE TABLE "Insight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentCgpa" REAL NOT NULL,
    "targetCgpa" REAL NOT NULL,
    "gap" REAL NOT NULL,
    "semester" TEXT NOT NULL,
    "recommendations" TEXT NOT NULL,
    CONSTRAINT "Insight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Insight_userId_key" ON "Insight"("userId");
