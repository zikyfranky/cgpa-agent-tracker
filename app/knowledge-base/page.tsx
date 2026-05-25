'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Filter,
  BarChart3,
  BookMarked
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Dummy data for initial UI layout
const levels = ['100L', '200L', '300L'];
const semesters = ['First Semester', 'Second Semester'];

interface Topic {
  id: string;
  title: string;
  status: 'MASTERED' | 'READING' | 'UNSEEN';
  difficulty: number;
}

interface Course {
  code: string;
  title: string;
  progress: number;
  topics: Topic[];
}

const KnowledgeAtlas = () => {
  const [activeLevel, setActiveLevel] = useState('300L');
  const [activeSemester, setActiveSemester] = useState('Second Semester');
  const [searchQuery, setSearchQuery] = useState('');

  // Example courses for 300L Sem 2
  const courses: Course[] = [
    {
      code: 'GPH308',
      title: 'Geophysical Magnetic Methods',
      progress: 45,
      topics: [
        { id: '1', title: 'Magnetic Susceptibility', status: 'MASTERED', difficulty: 3 },
        { id: '2', title: 'The Earth\'s Magnetic Field', status: 'READING', difficulty: 4 },
        { id: '3', title: 'Magnetic Anomalies', status: 'UNSEEN', difficulty: 5 },
      ]
    },
    {
      code: 'GPH312',
      title: 'Seismic Methods II',
      progress: 12,
      topics: [
        { id: '4', title: 'Elastic Wave Propagation', status: 'MASTERED', difficulty: 5 },
        { id: '5', title: 'Reflection Data Acquisition', status: 'UNSEEN', difficulty: 4 },
      ]
    },
    {
      code: 'GPH322',
      title: 'Electrical Methods in Geophysics',
      progress: 75,
      topics: [
        { id: '6', title: 'Resistivity of Rocks', status: 'MASTERED', difficulty: 2 },
        { id: '7', title: 'Apparent Resistivity', status: 'MASTERED', difficulty: 3 },
      ]
    }
  ];

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <BookMarked className="w-8 h-8 text-blue-500" />
            Knowledge Atlas
            </h1>
            <p className="text-gray-400">
            Mapping your technical mastery across the Geophysics curriculum.
            </p>
        </div>

        <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800 shadow-sm w-fit">
            {levels.map(level => (
                <button
                    key={level}
                    onClick={() => setActiveLevel(level)}
                    className={cn(
                        "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                        activeLevel === level 
                            ? "bg-blue-600 text-white shadow-sm" 
                            : "text-gray-500 hover:text-gray-700"
                    )}
                >
                    {level}
                </button>
            ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="space-y-6">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search topics or codes..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-blue-600" />
                    Filters
                </h3>
                <div className="space-y-2">
                    {semesters.map(sem => (
                        <button
                            key={sem}
                            onClick={() => setActiveSemester(sem)}
                            className={cn(
                                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                                activeSemester === sem 
                                    ? "bg-blue-50 text-blue-700 font-semibold border border-blue-100" 
                                    : "text-gray-600 hover:bg-gray-50"
                            )}
                        >
                            {sem}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-2xl p-5 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold">Mastery Stats</span>
                </div>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Overall Progress</span>
                            <span>38%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5">
                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '38%' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
            {courses.map(course => (
                <div key={course.code} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center">
                                    <BookOpen className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 leading-tight">{course.code}</h3>
                                    <p className="text-sm text-gray-500">{course.title}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <span className="text-2xl font-black text-gray-900">{course.progress}%</span>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Mastery</p>
                                </div>
                                <div className="w-16 h-16 relative">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle 
                                            cx="32" cy="32" r="28" 
                                            className="stroke-gray-100 fill-none" 
                                            strokeWidth="8"
                                        />
                                        <circle 
                                            cx="32" cy="32" r="28" 
                                            className="stroke-blue-600 fill-none transition-all duration-1000" 
                                            strokeWidth="8"
                                            strokeDasharray="175.9"
                                            strokeDashoffset={175.9 - (175.9 * course.progress) / 100}
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Key Topics</p>
                             {course.topics.map(topic => (
                                 <div key={topic.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-200 transition-colors cursor-pointer group">
                                     <div className="flex items-center gap-3">
                                         {topic.status === 'MASTERED' ? (
                                             <CheckCircle2 className="w-5 h-5 text-green-500" />
                                         ) : topic.status === 'READING' ? (
                                             <Clock className="w-5 h-5 text-amber-500" />
                                         ) : (
                                             <Circle className="w-5 h-5 text-gray-300" />
                                         )}
                                         <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{topic.title}</span>
                                     </div>
                                     <div className="flex items-center gap-4">
                                         <div className="flex gap-1">
                                             {[1, 2, 3, 4, 5].map(i => (
                                                 <div key={i} className={cn(
                                                     "w-1 h-3 rounded-full",
                                                     i <= topic.difficulty ? "bg-red-400" : "bg-gray-200"
                                                 )} />
                                             ))}
                                         </div>
                                         <ChevronRight className="w-4 h-4 text-gray-400" />
                                     </div>
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeAtlas;
