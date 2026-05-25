'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  GraduationCap, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Edit3,
  Save,
  X,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateGPA } from '@/lib/logic/engine';

const gradeConfig: Record<string, { bg: string, border: string, text: string, hex: string }> = {
  'A': { bg: 'bg-[#22c55e]', border: 'border-[#22c55e]', text: 'text-white', hex: '#22c55e' },
  'B': { bg: 'bg-[#3b82f6]', border: 'border-[#3b82f6]', text: 'text-white', hex: '#3b82f6' },
  'C': { bg: 'bg-[#f59e0b]', border: 'border-[#f59e0b]', text: 'text-white', hex: '#f59e0b' },
  'D': { bg: 'bg-[#f97316]', border: 'border-[#f97316]', text: 'text-white', hex: '#f97316' },
  'E': { bg: 'bg-[#ef4444]', border: 'border-[#ef4444]', text: 'text-white', hex: '#ef4444' },
  'F': { bg: 'bg-[#ef4444]', border: 'border-[#ef4444]', text: 'text-white', hex: '#ef4444' },
  'PENDING': { bg: 'bg-gray-800', border: 'border-gray-700', text: 'text-gray-400', hex: '#1f2937' }
};

export default function CoursesPage() {
  const [results, setResults] = useState<any[]>([]);
  const [activeLevel, setActiveLevel] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'}>({ key: 'courseCode', direction: 'asc' });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [draftResults, setDraftResults] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const levels = [100, 200, 300, 400, 500];
  const semesters = ['First Semester', 'Second Semester'];

  useEffect(() => {
    fetch('/api/results')
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setDraftResults(data);
        setLoading(false);
      });
  }, []);

  const handleDraftUpdate = (id: string, updates: any) => {
    setDraftResults(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const handleGlobalSave = async () => {
    setIsSaving(true);
    try {
      const changes = draftResults.filter(d => {
        const original = results.find(r => r.id === d.id);
        return original && (
          original.grade !== d.grade || 
          original.units !== d.units ||
          original.caScore !== d.caScore ||
          original.examScore !== d.examScore
        );
      });

      for (const change of changes) {
        await fetch('/api/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: change.id,
            grade: change.grade,
            gradePoint: change.gradePoint,
            caScore: change.caScore,
            examScore: change.examScore,
            units: change.units
          })
        });
      }
      
      const res = await fetch('/api/results');
      const data = await res.json();
      setResults(data);
      setDraftResults(data);
      setEditMode(false);
    } catch (e) {
      alert('Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const levelCounts = useMemo(() => {
    return results.reduce((acc: any, curr) => {
      acc[curr.level] = (acc[curr.level] || 0) + 1;
      return acc;
    }, {});
  }, [results]);

  const processedData = useMemo(() => {
    // Determine which dataset to use for filtration
    const baseData = editMode ? draftResults : results;
    let filtered = baseData.filter(r => r.level === activeLevel);
    
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.courseName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (gradeFilter) {
      filtered = filtered.filter(r => r.grade === gradeFilter);
    }

    return filtered.sort((a, b) => {
      const valA = a[sortConfig.key] ?? '';
      const valB = b[sortConfig.key] ?? '';
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [results, draftResults, editMode, activeLevel, searchTerm, gradeFilter, sortConfig]);

  const toggleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <div className="w-10 h-10 border-t-2 border-blue-500 rounded-full animate-spin"></div>
      <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Wiring Registry...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-32 px-4">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter">Registry</h1>
          </div>

          <div className="flex gap-3">
            <button 
                onClick={() => {
                   if(editMode) setDraftResults(results);
                   setEditMode(!editMode);
                }}
                className={cn(
                    "px-6 py-4 rounded-2xl border transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95",
                    editMode ? "border-red-500 bg-red-500/10 text-red-500" : "bg-gray-950 border-gray-800 text-gray-500 hover:text-white"
                )}
            >
                {editMode ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                {editMode ? "Cancel" : "Edit Mode"}
            </button>

            {editMode && (
                <button 
                   onClick={handleGlobalSave}
                   disabled={isSaving}
                   className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-blue-500 active:scale-95 disabled:opacity-50"
                >
                   {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                   {isSaving ? "Saving..." : "Save Registry"}
                </button>
            )}
          </div>
        </div>
        
        <div className="flex bg-gray-950 p-2 rounded-2xl border border-gray-800 shadow-xl overflow-x-auto no-scrollbar gap-2">
          {levels.map(lvl => (
            <button
              key={lvl}
              onClick={() => setActiveLevel(lvl)}
              className={cn(
                "px-8 py-4 rounded-xl text-[12px] font-black transition-all uppercase tracking-widest flex items-center gap-3 shrink-0",
                activeLevel === lvl ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
              )}
            >
              {lvl}L
              <span className={cn("px-2 py-1 rounded-md text-[9px]", activeLevel === lvl ? "bg-blue-500 text-white" : "bg-gray-900 text-gray-600 border border-gray-800")}>
                {levelCounts[lvl] || 0}
              </span>
            </button>
          ))}
        </div>
      </header>

      <div className="my-12 space-y-6 p-6 bg-gray-900/50 border border-gray-800 rounded-[2.5rem] backdrop-blur-md">
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="relative flex-1 group min-h-[84px]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search curriculum..."
              className="w-full h-[84px] pl-20 pr-10 text-lg py-6 bg-gray-950 border border-gray-800 rounded-2xl text-base text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-gray-700 font-bold transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            {['A', 'B', 'C', 'D', 'F'].map(g => {
              const cfg = gradeConfig[g];
              const isActive = gradeFilter === g;
              return (
                <button
                  key={g}
                  onClick={() => setGradeFilter(isActive ? null : g)}
                  className={cn(
                    "px-6 py-3 rounded-xl text-[11px] font-black border transition-all active:scale-95 shadow-sm",
                    isActive 
                      ? "text-white" 
                      : "bg-transparent text-gray-400 hover:bg-gray-800"
                  )}
                  style={{ 
                    borderColor: cfg.hex,
                    backgroundColor: isActive ? cfg.hex : 'transparent',
                    color: isActive ? '#fff' : cfg.hex
                  }}
                >
                  GRADE {g}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between pt-4 border-t border-gray-800/40 gap-4">
          <div className="flex gap-6">
             {[
               { id: 'gradePoint', label: 'By Performance' },
               { id: 'units', label: 'By Unit Load' },
               { id: 'courseCode', label: 'By Code' }
             ].map(opt => (
               <button
                 key={opt.id}
                 onClick={() => toggleSort(opt.id)}
                 className={cn(
                   "text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                   sortConfig.key === opt.id ? "text-blue-500" : "text-gray-600 hover:text-gray-400"
                 )}
               >
                 {opt.label}
                 {sortConfig.key === opt.id && (
                   sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                 )}
               </button>
             ))}
          </div>
          {gradeFilter && (
            <button onClick={() => setGradeFilter(null)} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline px-4">Clear Filters</button>
          )}
        </div>
      </div>

      <div className="space-y-24">
        {semesters.map(semester => {
          const semData = processedData.filter(r => r.semester === semester);
          const semUnits = semData.reduce((acc, c) => acc + c.units, 0);
          const semGpa = calculateGPA(semData);
          
          if (semData.length === 0 && activeLevel > 300) return null;

          return (
            <section key={semester} className="space-y-8 pt-20 first:pt-4">
               <div className="flex items-center justify-between gap-4 pb-6 border-b border-gray-900">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">{semester}</h2>
                    <div className="h-1.5 w-16 bg-blue-600 rounded-full"></div>
                  </div>
                  <div className="flex bg-blue-600/10 border border-blue-600/20 rounded-full px-6 py-3 items-center gap-6 shadow-2xl">
                        <div className="flex items-center gap-2 pr-6 border-r border-blue-600/20">
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Units</span>
                            <span className="text-lg font-black text-white tabular-nums">{semUnits}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">GPA</span>
                            <span className="text-lg font-black text-white tabular-nums">{semGpa.toFixed(2)}</span>
                        </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {semData.map((r) => {
                    const gradeStyle = gradeConfig[r.grade || 'PENDING'];
                    const gpMap: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0, PENDING: 0 };
                    
                    return (
                      <div key={r.id} className={cn(
                          "group bg-gray-900 border border-gray-800 rounded-[2.5rem] border-l-[4px] transition-all duration-300 flex flex-col justify-between h-full hover:bg-gray-800/80 hover:-translate-y-2 shadow-2xl"
                      )} style={{ borderLeftColor: gradeStyle.hex }}>
                          <div className="p-8">
                            <div className="flex justify-between items-start mb-8">
                                <div className="space-y-1">
                                    <div className="text-2xl font-black text-white italic tracking-tighter uppercase group-hover:text-blue-400 transition-colors">
                                        {r.courseCode}
                                    </div>
                                    <p className="text-[12px] font-bold text-gray-500 uppercase tracking-tight line-clamp-1 leading-tight">
                                        {r.courseName}
                                    </p>
                                </div>
                                {editMode ? (
                                    <select 
                                        className="w-16 h-16 rounded-3xl bg-gray-950 border-2 border-blue-500 text-xl font-black text-white text-center appearance-none outline-none cursor-pointer"
                                        value={r.grade}
                                        onChange={(e) => handleDraftUpdate(r.id, { grade: e.target.value, gradePoint: gpMap[e.target.value] || 0 })}
                                    >
                                        {['PENDING','A','B','C','D','E','F'].map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                ) : (
                                    <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-2xl font-black transition-all shadow-xl text-white" 
                                         style={{ backgroundColor: gradeStyle.hex }}>
                                        {r.grade === 'PENDING' ? '?' : r.grade}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-gray-800/60 mt-4">
                                <div className="flex items-center gap-10">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Credits</p>
                                        {editMode ? (
                                            <input 
                                                type="number"
                                                className="w-14 bg-gray-950 border border-gray-800 rounded-xl text-lg font-black text-white text-center py-1"
                                                value={r.units}
                                                onChange={(e) => handleDraftUpdate(r.id, { units: parseInt(e.target.value) || 0 })}
                                            />
                                        ) : (
                                            <span className="text-lg font-black text-gray-200">{r.units}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Grade Points</p>
                                        <span className="text-lg font-black text-gray-200">{r.gradePoint}</span>
                                    </div>
                                </div>
                                <div className="ml-auto">
                                    {!editMode && (
                                        r.grade === 'F' ? (
                                            <div className="p-3 rounded-2xl" style={{ backgroundColor: `${gradeStyle.hex}15`, border: `1px solid ${gradeStyle.hex}30` }}>
                                                <AlertCircle className="w-6 h-6" style={{ color: gradeStyle.hex }} />
                                            </div>
                                        ) : r.grade !== 'PENDING' ? (
                                            <div className="p-3 rounded-2xl" style={{ backgroundColor: `${gradeStyle.hex}15`, border: `1px solid ${gradeStyle.hex}30` }}>
                                                <CheckCircle2 className="w-6 h-6" style={{ color: gradeStyle.hex }} />
                                            </div>
                                        ) : null
                                    )}
                                </div>
                            </div>
                          </div>
                      </div>
                    );
                  })}
               </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
