'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, Save, RefreshCcw, Layout, FileEdit, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SimulatorPage() {
  const [results, setResults] = useState<any[]>([]);
  const [activeLevel, setActiveLevel] = useState(300);
  const [activeSemester, setActiveSemester] = useState('Second Semester');
  const [mode, setMode] = useState<'GRADE' | 'MANUAL'>('GRADE');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/results')
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setLoading(false);
      });
  }, []);

  const currentCourses = results.filter(r => r.level === activeLevel && r.semester === activeSemester);

  const calculateGrade = (ca: number, ex: number) => {
    const total = (ca || 0) + (ex || 0);
    if (total >= 70) return { g: 'A', p: 5 };
    if (total >= 60) return { g: 'B', p: 4 };
    if (total >= 50) return { g: 'C', p: 3 };
    if (total >= 45) return { g: 'D', p: 2 };
    if (total >= 40) return { g: 'E', p: 1 };
    return { g: 'F', p: 0 };
  };

  const handleUpdate = (id: string, updates: any) => {
    setResults(results.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const calculateProposedGPA = () => {
    let qp = 0, units = 0;
    currentCourses.forEach(c => {
      const gInfo = mode === 'MANUAL' ? calculateGrade(c.caScore, c.examScore) : { g: c.grade, p: c.gradePoint };
      const point = gInfo.p || 0;
      qp += point * c.units;
      units += c.units;
    });
    return units === 0 ? "0.00" : (qp / units).toFixed(2);
  };

  if (loading) return <div className="p-20 text-white italic">Calibrating Simulator...</div>;

  return (
    <div className="space-y-8 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
            <Calculator className="w-10 h-10 text-blue-500" />
            Simulator
          </h1>
          <p className="text-gray-400 font-medium">Predicting outcome for {activeLevel}L {activeSemester}.</p>
        </div>
        <div className="flex bg-gray-900 p-1.5 rounded-2xl border border-gray-800">
           <button onClick={() => setMode('GRADE')} className={cn("px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", mode === 'GRADE' ? "bg-blue-600 text-white shadow-lg" : "text-gray-500")}>Dropdown</button>
           <button onClick={() => setMode('MANUAL')} className={cn("px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", mode === 'MANUAL' ? "bg-blue-600 text-white shadow-lg" : "text-gray-500")}>Manual</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-900/50 border border-gray-800 rounded-[2.5rem] overflow-hidden backdrop-blur-md">
            <div className="px-8 py-6 border-b border-gray-800 bg-gray-800/10 flex justify-between items-center">
               <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Course Matrix</span>
               <div className="flex gap-4">
                  <select 
                    className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-1 text-[10px] font-black text-gray-400 outline-none"
                    value={activeLevel} 
                    onChange={e => setActiveLevel(parseInt(e.target.value))}
                  >
                    {[100,200,300,400,500].map(l => <option key={l} value={l}>{l}L</option>)}
                  </select>
                  <select 
                    className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-1 text-[10px] font-black text-gray-400 outline-none"
                    value={activeSemester}
                    onChange={e => setActiveSemester(e.target.value)}
                  >
                    <option value="First Semester">First Sem</option>
                    <option value="Second Semester">Second Sem</option>
                  </select>
               </div>
            </div>
            <div className="divide-y divide-gray-800/40">
              {currentCourses.length > 0 ? currentCourses.map(course => (
                <div key={course.id} className="px-8 py-6 flex items-center gap-6 group hover:bg-white/[0.01] transition-all">
                  <div className="flex-1">
                    <div className="text-sm font-black text-gray-200 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{course.courseCode}</div>
                    <div className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter truncate max-w-[200px]">{course.courseName}</div>
                  </div>
                  
                  <div className="w-16 text-center">
                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">{course.units}U</span>
                  </div>

                  {mode === 'GRADE' ? (
                     <select 
                        className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white font-black focus:ring-1 focus:ring-blue-500 outline-none"
                        value={course.grade}
                        onChange={e => {
                          const grades: any = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'F': 0, 'PENDING': 0 };
                          handleUpdate(course.id, { grade: e.target.value, gradePoint: grades[e.target.value] });
                        }}
                     >
                       {['PENDING','A','B','C', 'D', 'E', 'F'].map(g => <option key={g} value={g}>{g}</option>)}
                     </select>
                  ) : (
                    <div className="flex gap-2 shrink-0">
                       <input 
                        type="number" placeholder="CA" 
                        className="w-16 bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-center text-sm text-white font-black focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-gray-900"
                        value={course.caScore || ''}
                        onChange={(e) => handleUpdate(course.id, { caScore: e.target.value })}
                       />
                       <input 
                        type="number" placeholder="EX" 
                        className="w-16 bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-center text-sm text-white font-black focus:ring-1 focus:ring-blue-500 outline-none placeholder:text-gray-900"
                        value={course.examScore || ''}
                        onChange={(e) => handleUpdate(course.id, { examScore: e.target.value })}
                       />
                    </div>
                  )}

                  <div className="w-12 h-12 bg-gray-950 border border-gray-800 rounded-2xl flex items-center justify-center text-sm font-black text-blue-500 shadow-inner">
                    {mode === 'MANUAL' ? calculateGrade(parseFloat(course.caScore), parseFloat(course.examScore)).g : (course.grade === 'PENDING' ? '?' : course.grade)}
                  </div>
                </div>
              )) : (
                <div className="px-8 py-12 text-center text-[10px] font-black text-gray-700 uppercase tracking-[0.3em]">Curriculum Void</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-900/30 border border-blue-500/20 relative overflow-hidden">
             <div className="relative z-10">
                <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.25em]">Proposed Outcome</span>
                <div className="flex items-baseline gap-2 mt-2">
                   <div className="text-7xl font-black tracking-tighter">{calculateProposedGPA()}</div>
                   <span className="text-blue-200 text-xs font-black uppercase tracking-widest">GPA</span>
                </div>
                <div className="mt-8 space-y-4 pt-6 border-t border-blue-500/30">
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-blue-100 uppercase tracking-widest">Projected Standing</span>
                      <span className="text-[10px] font-black bg-blue-500 px-3 py-1 rounded-full uppercase italic">2nd Lower (2.2)</span>
                   </div>
                   <button className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-transform active:scale-95">
                      <Database className="w-4 h-4" /> Commit to Records
                   </button>
                </div>
             </div>
             <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-[2rem] p-6">
             <div className="flex items-center gap-3 mb-4">
                <FileEdit className="w-5 h-5 text-blue-500" />
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Simulation Log</h3>
             </div>
             <p className="text-[10px] text-gray-500 leading-relaxed font-bold uppercase tracking-tight">
               Changes made here are temporary until <span className="text-gray-300">"Commit to Records"</span> is hit. This updates your permanent academic history for future AI learning contexts.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
