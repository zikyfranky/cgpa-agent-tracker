-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "courseCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'UNSEEN',
    "feedback" TEXT,
    "sourceFile" TEXT,
    "lastStudiedAt" DATETIME,
    CONSTRAINT "Topic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Timetable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "courseCode" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "location" TEXT,
    CONSTRAINT "Timetable_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matricNumber" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "targetCgpa" REAL NOT NULL DEFAULT 3.5,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("createdAt", "id", "matricNumber", "role", "targetCgpa") SELECT "createdAt", "id", "matricNumber", "role", "targetCgpa" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_matricNumber_key" ON "User"("matricNumber");
CREATE TABLE "new_UserState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "currentLevel" INTEGER NOT NULL DEFAULT 300,
    "currentSemester" TEXT NOT NULL DEFAULT 'Second Semester',
    "activeTab" TEXT NOT NULL DEFAULT '300',
    CONSTRAINT "UserState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserState" ("activeTab", "currentLevel", "currentSemester", "id", "userId") SELECT "activeTab", "currentLevel", "currentSemester", "id", "userId" FROM "UserState";
DROP TABLE "UserState";
ALTER TABLE "new_UserState" RENAME TO "UserState";
CREATE UNIQUE INDEX "UserState_userId_key" ON "UserState"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Topic_courseCode_idx" ON "Topic"("courseCode");
