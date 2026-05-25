-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Result" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "courseCode" TEXT NOT NULL,
    "courseName" TEXT,
    "units" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL,
    "semester" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "gradePoint" INTEGER NOT NULL,
    "caScore" REAL,
    "examScore" REAL,
    CONSTRAINT "Result_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Result" ("caScore", "courseCode", "courseName", "examScore", "grade", "gradePoint", "id", "level", "semester", "userId") SELECT "caScore", "courseCode", "courseName", "examScore", "grade", "gradePoint", "id", "level", "semester", "userId" FROM "Result";
DROP TABLE "Result";
ALTER TABLE "new_Result" RENAME TO "Result";
CREATE UNIQUE INDEX "Result_userId_courseCode_level_semester_key" ON "Result"("userId", "courseCode", "level", "semester");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
