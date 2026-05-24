"use client";

import { useState, useEffect } from "react";

interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  grade: string;
}

const gradePoints: Record<string, number> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
  F: 0,
};

export default function CGPACalculator() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [previousGPA, setPreviousGPA] = useState<number>(3.19);
  const [previousCredits, setPreviousCredits] = useState<number>(100);
  const [catalog, setCatalog] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/records")
      .then((res) => res.json())
      .then((data) => {
        if (data.courses) {
           setCourses(data.courses);
           setPreviousGPA(data.previousGPA || 3.19);
           setPreviousCredits(data.previousCredits || 100);
        }
        if (data.catalog) {
           setCatalog(data.catalog);
        }
      });
  }, []);

  const saveToDB = async () => {
    setIsSaving(true);
    await fetch("/api/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courses, previousGPA, previousCredits }),
    });
    setIsSaving(false);
  };

  const addFromCatalog = (level: string, semester: string) => {
    if (!catalog) return;
    const catCourses = catalog.levels[level]?.semesters[semester]?.courses;
    if (catCourses) {
      const newCourses = catCourses.map((c: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        code: c.code,
        name: c.title,
        credits: c.units,
        grade: "A",
      }));
      setCourses([...courses, ...newCourses]);
    }
  };

  const calculateNewCGPA = () => {
    let currentTotalPoints = 0;
    let currentTotalCredits = 0;
    courses.forEach((course) => {
      currentTotalPoints += gradePoints[course.grade] * course.credits;
      currentTotalCredits += course.credits;
    });

    const totalPoints = previousGPA * previousCredits + currentTotalPoints;
    const totalCredits = previousCredits + currentTotalCredits;

    return totalCredits === 0 ? 0 : totalPoints / totalCredits;
  };

  return (
    <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          CGPA Tracker 2.0
        </h2>
        <button 
          onClick={saveToDB}
          disabled={isSaving}
          className="text-xs px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Progress"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
          <p className="text-sm text-zinc-500 mb-1">Academic Base</p>
          <input 
             type="number"
             step="0.01"
             className="text-3xl font-bold text-blue-600 bg-transparent w-full focus:outline-none"
             value={previousGPA}
             onChange={(e) => setPreviousGPA(parseFloat(e.target.value))}
          />
        </div>
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
          <p className="text-sm text-zinc-500 mb-1">Projected CGPA</p>
          <p className="text-3xl font-bold text-green-600">
            {calculateNewCGPA().toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        <button onClick={() => addFromCatalog("300", "First Semester")} className="whitespace-nowrap px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded text-xs hover:bg-zinc-200">+ 300L Sem 1</button>
        <button onClick={() => addFromCatalog("300", "Second Semester")} className="whitespace-nowrap px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded text-xs hover:bg-zinc-200">+ 300L Sem 2</button>
      </div>

      <div className="space-y-4 mb-6">
        {courses.map((course) => (
          <div key={course.id} className="flex items-center gap-3 p-3 border border-zinc-100 dark:border-zinc-800 rounded-lg">
            <div className="flex-1 min-w-0">
               <p className="text-xs font-bold text-zinc-500">{course.code}</p>
               <input
                type="text"
                placeholder="Course Name"
                className="w-full bg-transparent text-sm border-none focus:outline-none focus:ring-0 p-0"
                value={course.name}
                onChange={(e) => setCourses(courses.map(c => c.id === course.id ? {...c, name: e.target.value} : c))}
              />
            </div>
            <input
              type="number"
              className="w-12 bg-transparent text-center border-b border-zinc-200 dark:border-zinc-700 focus:outline-none"
              value={course.credits}
              onChange={(e) => setCourses(courses.map(c => c.id === course.id ? {...c, credits: parseInt(e.target.value)} : c))}
            />
            <select
              className="bg-transparent border-b border-zinc-200 dark:border-zinc-700 focus:outline-none text-sm"
              value={course.grade}
              onChange={(e) => setCourses(courses.map(c => c.id === course.id ? {...c, grade: e.target.value} : c))}
            >
              {Object.keys(gradePoints).map((grade) => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
            <button onClick={() => setCourses(courses.filter(c => c.id !== course.id))} className="text-red-500">×</button>
          </div>
        ))}
      </div>

      <button
        onClick={() => setCourses([...courses, { id: Math.random().toString(36).substr(2, 9), code: "NEW", name: "", credits: 2, grade: "A" }])}
        className="w-full py-2 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-400"
      >
        + Add custom course
      </button>
    </div>
  );
}
