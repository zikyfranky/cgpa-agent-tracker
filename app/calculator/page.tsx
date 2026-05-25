'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, Save, RefreshCcw, Database, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateGPA } from '@/lib/logic/engine';

const gradeConfig: Record<string, string> = {
  'A': '#22c55e',
  'B': '#3b82f6',
  'C': '#f59e0b',
  'D': '#f97316',
  'E': '#ef4444',
  'F': '#ef4444',
  'PENDING': '#1f2937'
};

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
      const gInfo = mode === 'MANUAL' ? calculateGrade(parseFloat(c.caScore), parseFloat(c.examScore)) : { g: c.grade, p: c.gradePoint };
      const point = gInfo.p || 0;
      qp += point * c.units;
      units += c.units;
    });
    return units === 0 ? "0.00" : (qp / units).toFixed(2);
  };

  const handleCommit = async () => {
    try {
      const pendingUpdates = currentCourses.map(c => {
        const gInfo = mode === 'MANUAL' ? calculateGrade(c.caScore, c.examScore) : { g: c.grade, p: c.gradePoint };
        return {
          id: c.id,
          grade: gInfo.g,
          gradePoint: gInfo.p,
          caScore: c.caScore,
          examScore: c.examScore
        };
      });

      for (const update of pendingUpdates) {
        await fetch('/api/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update)
        });
      }
      alert('Synced.');
      window.location.reload();
    } catch (e) { alert('Failed.'); }
  };

  if (loading) return <div className="p-20 text-white italic">Calibrating...</div>;

  return (
    <div className="space-y-8 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3 italic">
            <Calculator className="w-10 h-10 text-blue-500" />
            Simulator
          </h1>
        </div>
        <div className="flex bg-gray-950 p-1 rounded-xl border border-gray-800">
           <button onClick={() => setMode('GRADE')} className={cn("px-5 py-2 rounded-lg text-[10px] font-black uppercase transition-all", mode === 'GRADE' ? "bg-blue-600 text-white" : "text-gray-600")}>Grade</button>
           <button onClick={() => setMode('MANUAL')} className={cn("px-5 py-2 rounded-lg text-[10px] font-black uppercase transition-all", mode === 'MANUAL' ? "bg-blue-600 text-white" : "text-gray-600")}>Scores</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-900 overflow-hidden rounded-[2rem] border border-gray-800">
            <div className="px-8 py-5 border-b border-gray-800 bg-gray-800/10 flex justify-between items-center">
               <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Matrix</span>
               <div className="flex gap-4">
                  <select value={activeLevel} onChange={e => setActiveLevel(parseInt(e.target.value))} className="bg-gray-950 text-white text-[10px] font-bold border border-gray-800 rounded px-2">
                    {[100,200,300,400,500].map(l => <option key={l} value={l}>{l}L</option>)}
                  </select>
                  <select value={activeSemester} onChange={e => setActiveSemester(e.target.value)} className="bg-gray-950 text-white text-[10px] font-bold border border-gray-800 rounded px-2">
                    <option value="First Semester">Sem 1</option>
                    <option value="Second Semester">Sem 2</option>
                  </select>
               </div>
            </div>
            <div className="divide-y divide-gray-800/30">
              {currentCourses.map(course => {
                const manualG = calculateGrade(parseFloat(course.caScore), parseFloat(course.examScore)).g;
                const g = mode === 'MANUAL' ? manualG : course.grade;
                return (
                  <div key={course.id} className="px-8 py-6 flex items-center gap-6 group border-l-4" style={{ borderLeftColor: gradeConfig[g || 'PENDING'] }}>
                    <div className="flex-1">
                      <div className="text-base font-black text-white uppercase italic">{course.courseCode}</div>
                      <div className="text-[9px] font-bold text-gray-600 uppercase tracking-tight">{course.courseName}</div>
                    </div>

                    {mode === 'MANUAL' ? (
                      <div className="flex gap-2">
                         <input type="number" placeholder="CA" className="w-14 bg-gray-950 border border-gray-800 rounded-lg py-2 text-center text-xs text-white" value={course.caScore || ''} onChange={e => handleUpdate(course.id, { caScore: e.target.value })}/>
                         <input type="number" placeholder="EX" className="w-14 bg-gray-950 border border-gray-800 rounded-lg py-2 text-center text-xs text-white" value={course.examScore || ''} onChange={e => handleUpdate(course.id, { examScore: e.target.value })}/>
                      </div>
                    ) : (
                        <select className="bg-gray-950 border border-gray-800 rounded-lg px-2 py-2 text-xs text-white outline-none" value={course.grade} onChange={e => {
                        const gpMap: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0, PENDING: 0 };
                        handleUpdate(course.id, { grade: e.target.value, gradePoint: gpMap[e.target.value] || 0 });
                      }}>
                         {['PENDING','A','B','C','D','E','F'].map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    )}

                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-black text-white shadow-xl" style={{ backgroundColor: gradeConfig[g || 'PENDING'] }}>
                      {g === 'PENDING' ? '?' : g}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
             <div className="relative z-10 text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">Outcome Simulator</span>
                <div className="text-7xl font-black italic tracking-tighter my-4 drop-shadow-2xl">{calculateProposedGPA()}</div>
                <button onClick={handleCommit} className="w-full mt-6 py-4 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3">
                   <Database className="w-4 h-4" /> Finalize Result
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}