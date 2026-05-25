'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, Save, RefreshCcw, Database, AlertCircle, Loader2 } from 'lucide-react';
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
  const [activeLevel, setActiveLevel] = useState<number | null>(null);
  const [activeSemester, setActiveSemester] = useState<string | null>(null);
  const [mode, setMode] = useState<'GRADE' | 'MANUAL'>('GRADE');
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetch('/api/results')
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setLoading(false);
      });
  }, []);

  const currentCourses = results.filter(r => r.level === activeLevel && r.semester === activeSemester && activeLevel !== null);

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
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      // Only allow syncing results that were previously PENDING
      const pendingUpdates = currentCourses
        .filter(c => c.grade === 'PENDING') 
        .map(c => {
          const gInfo = mode === 'MANUAL' ? calculateGrade(c.caScore, c.examScore) : { g: c.grade, p: c.gradePoint };
          return {
            id: c.id,
            grade: gInfo.g,
            gradePoint: gInfo.p,
            caScore: c.caScore,
            examScore: c.examScore
          };
        });
      
      if (pendingUpdates.length === 0) {
        alert('No future/pending results to finalize in this selection.');
        setIsSyncing(false);
        return;
      }

      for (const update of pendingUpdates) {
        await fetch('/api/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update)
        });
      }
      window.location.reload();
    } catch (e) { 
        alert('Failed synchronization.');
    } finally {
        setIsSyncing(false);
    }
  };

  if (loading || activeLevel === null) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <div className="w-12 h-12 border-t-2 border-blue-500 rounded-full animate-spin"></div>
      <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Waking Simulator...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-32 px-4 pt-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4 italic uppercase">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Calculator className="w-7 h-7 text-white" />
            </div>
            Simulator
          </h1>
        </div>
        <div className="flex bg-gray-950 p-1.5 rounded-2xl border border-gray-800 shadow-xl">
           <button onClick={() => setMode('GRADE')} className={cn("px-8 py-3 rounded-xl text-[11px] font-black uppercase transition-all tracking-widest", mode === 'GRADE' ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-white")}>Grade</button>
           <button onClick={() => setMode('MANUAL')} className={cn("px-8 py-3 rounded-xl text-[11px] font-black uppercase transition-all tracking-widest", mode === 'MANUAL' ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-white")}>Scores</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-900 overflow-hidden rounded-[2.5rem] border border-gray-800 shadow-2xl">
            <div className="px-10 py-8 border-b border-gray-800 bg-gray-800/10 flex justify-between items-center">
               <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Active Matrix</span>
               <div className="flex gap-4">
                  <select 
                    value={activeLevel || 0} 
                    onChange={e => setActiveLevel(parseInt(e.target.value))} 
                    className="bg-gray-950 text-white text-[12px] font-black border border-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none min-w-[80px] text-center"
                  >
                    {[100,200,300,400,500].map(l => <option key={l} value={l}>{l}L</option>)}
                  </select>
                  <select 
                    value={activeSemester || ""} 
                    onChange={e => setActiveSemester(e.target.value)} 
                    className="bg-gray-950 text-white text-[12px] font-black border border-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none min-w-[100px] text-center"
                  >
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
                  <div key={course.id} className="px-10 py-8 flex items-center gap-8 group border-l-4 transition-all hover:bg-gray-800/20" style={{ borderLeftColor: gradeConfig[g || 'PENDING'] }}>
                    <div className="flex-1">
                      <div className="text-xl font-black text-white uppercase italic tracking-tighter group-hover:text-blue-400 transition-all">{course.courseCode}</div>
                      <div className="text-[10px] font-bold text-gray-600 uppercase tracking-tight line-clamp-1">{course.courseName}</div>
                    </div>

                    {mode === 'MANUAL' ? (
                      <div className="flex gap-3">
                         <div className="space-y-1">
                            <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest pl-1">CA</span>
                            <input type="number" className="w-16 h-12 bg-gray-950 border border-gray-800 rounded-xl text-center text-sm font-black text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none" value={course.caScore || ''} onChange={e => handleUpdate(course.id, { caScore: e.target.value })}/>
                         </div>
                         <div className="space-y-1">
                            <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest pl-1">Exam</span>
                            <input type="number" className="w-16 h-12 bg-gray-950 border border-gray-800 rounded-xl text-center text-sm font-black text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none" value={course.examScore || ''} onChange={e => handleUpdate(course.id, { examScore: e.target.value })}/>
                         </div>
                      </div>
                    ) : (
                        <select className="bg-gray-950 border border-gray-800 rounded-xl px-4 h-12 text-sm font-black text-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none min-w-[80px] text-center" value={course.grade} onChange={e => {
                        const gpMap: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0, PENDING: 0 };
                        handleUpdate(course.id, { grade: e.target.value, gradePoint: gpMap[e.target.value] || 0 });
                      }}>
                         {['PENDING','A','B','C','D','E','F'].map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    )}

                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black text-white shadow-xl transition-all" style={{ backgroundColor: gradeConfig[g || 'PENDING'] }}>
                      {g === 'PENDING' ? '?' : g}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-600 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden transition-all border-4 border-white/5">
             <div className="relative z-10 text-center">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-200">Outcome Simulator</span>
                <div className="text-8xl font-black italic tracking-tighter my-8 drop-shadow-2xl">{calculateProposedGPA()}</div>
                <button 
                    onClick={handleCommit} 
                    disabled={isSyncing}
                    className={cn(
                        "w-full py-5 bg-white text-blue-600 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed",
                        isSyncing ? "animate-pulse" : "hover:shadow-2xl hover:-translate-y-1"
                    )}
                >
                   {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
                   {isSyncing ? "Syncing Logic..." : "Finalize Result"}
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}