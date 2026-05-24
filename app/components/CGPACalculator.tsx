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
  const [isSaving, setIsSaving] = useState(false);

  // Load from "DB" (JSON file)
  useEffect(() => {
    fetch("/api/records")
      .then((res) => res.json())
      .then((data) => {
        if (data.courses) {
           setCourses(data.courses);
           setPreviousGPA(data.previousGPA || 3.19);
           setPreviousCredits(data.previousCredits || 100);
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

  const addCourse = () => {
    const newCourse: Course = {
      id: Math.random().toString(36).substr(2, 9),
      code: "",
      name: "",
      credits: 3,
      grade: "A",
    };
    setCourses([...courses, newCourse]);
  };

  const updateCourse = (id: string, field: keyof Course, value: any) => {
    setCourses(
      courses.map((course) =>
        course.id === id ? { ...course, [field]: value } : course
      )
    );
  };

  const removeCourse = (id: string) => {
    setCourses(courses.filter((course) => course.id !== id));
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
          <p className="text-sm text-zinc-500 mb-1">Current Base</p>
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

      <div className="space-y-4 mb-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="flex items-center gap-3 p-3 border border-zinc-100 dark:border-zinc-800 rounded-lg"
          >
            <input
              type="text"
              placeholder="Course Code"
              className="flex-1 bg-transparent border-b border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-blue-500"
              value={course.code}
              onChange={(e) => updateCourse(course.id, "code", e.target.value)}
            />
            <input
              type="number"
              placeholder="Units"
              className="w-16 bg-transparent border-b border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-blue-500"
              value={course.credits}
              onChange={(e) =>
                updateCourse(course.id, "credits", parseInt(e.target.value))
              }
            />
            <select
              className="bg-transparent border-b border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-blue-500 text-sm p-1"
              value={course.grade}
              onChange={(e) => updateCourse(course.id, "grade", e.target.value)}
            >
              {Object.keys(gradePoints).map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
            <button
              onClick={() => removeCourse(course.id)}
              className="text-red-500 hover:text-red-600 p-1"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addCourse}
        className="w-full py-3 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-500 hover:border-blue-500 hover:text-blue-500 transition-all font-medium mb-4"
      >
        + Add Current Semester Course
      </button>

      <div className="text-xs text-zinc-400 italic">
        * Calculation based on your current academic base.
      </div>
    </div>
  );
}
