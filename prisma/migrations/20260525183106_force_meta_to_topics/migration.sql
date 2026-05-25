-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Topic" (
    "level" INTEGER NOT NULL DEFAULT 300,
    "semester" TEXT NOT NULL DEFAULT 'Second Semester',
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "courseCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'UNSEEN',
    "feedback" TEXT,
    "sourceFile" TEXT,
    "lastStudiedAt" DATETIME,
    CONSTRAINT "Topic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Topic" ("content", "courseCode", "difficulty", "feedback", "id", "lastStudiedAt", "sourceFile", "status", "title", "userId") SELECT "content", "courseCode", "difficulty", "feedback", "id", "lastStudiedAt", "sourceFile", "status", "title", "userId" FROM "Topic";
DROP TABLE "Topic";
ALTER TABLE "new_Topic" RENAME TO "Topic";
CREATE INDEX "Topic_courseCode_idx" ON "Topic"("courseCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
