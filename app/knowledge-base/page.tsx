'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, Search, CheckCircle2, Circle, Clock, ChevronRight, Layers, Target, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function KnowledgeAtlas() {
  const [topics, setTopics] = useState<any[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [activeCourse, setActiveCourse] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/topics')
      .then(res => res.json())
      .then(data => {
        setTopics(data);
        const uniqueCourses = Array.from(new Set(data.map((t: any) => t.courseCode))) as string[];
        setCourses(uniqueCourses.sort());
        if (uniqueCourses.length > 0) setActiveCourse(uniqueCourses[0]);
        setLoading(false);
      });
  }, []);

  const toggleMastery = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'MASTERED' ? 'UNSEEN' : 'MASTERED';
    setTopics(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    
    await fetch('/api/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus })
    });
  };

  const filteredTopics = useMemo(() => {
    return topics.filter(t => 
      t.courseCode === activeCourse && 
      t.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [topics, activeCourse, searchTerm]);

  const stats = useMemo(() => {
    const total = topics.length;
    const mastered = topics.filter(t => t.status === 'MASTERED').length;
    return {
      total,
      mastered,
      percent: total > 0 ? ((mastered / total) * 100).toFixed(1) : 0
    };
  }, [topics]);

  if (loading) return <div className="p-20 text-center text-white font-black uppercase italic animate-pulse">Mapping Knowledge Nodes...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-32 px-4 pt-6">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Knowledge Atlas</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Recursive Learning Engine</p>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-10 shadow-xl">
           <div className="space-y-1 w-full sm:w-auto">
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest block">Mastery Progress</span>
              <div className="flex items-center gap-3">
                 <div className="text-3xl font-black text-white italic">{stats.percent}%</div>
                 <div className="w-32 h-2 bg-gray-950 rounded-full overflow-hidden border border-gray-800">
                    <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${stats.percent}%` }}></div>
                 </div>
              </div>
           </div>
           <div className="hidden sm:block h-10 w-px bg-gray-800"></div>
           <div className="w-full sm:w-auto">
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest block">Total Nodes</span>
              <div className="text-2xl font-black text-white">{stats.total}</div>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4 overflow-y-auto max-h-[70vh] no-scrollbar pr-2">
           <div className="flex items-center gap-3 mb-4 px-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              <h2 className="text-xs font-black text-white uppercase tracking-widest">Curriculum</h2>
           </div>
           {courses.map(code => (
             <button 
                key={code} 
                onClick={() => setActiveCourse(code)}
                className={cn(
                    "w-full text-left p-5 rounded-2xl border transition-all group flex justify-between items-center shadow-lg",
                    activeCourse === code ? "bg-indigo-600 border-indigo-500 text-white" : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700"
                )}
             >
                <span className="font-black italic tracking-tight">{code}</span>
                <ChevronRight className={cn("w-4 h-4 transition-transform", activeCourse === code ? "text-white rotate-90" : "text-gray-700")} />
             </button>
           ))}
        </div>

        <div className="lg:col-span-3 space-y-6">
           <div className="relative group overflow-hidden rounded-[2.5rem] bg-gray-900 border border-gray-800 p-8 shadow-2xl min-h-[60vh]">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                 <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">{activeCourse} Exploration</h3>
                 </div>
                 <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input 
                        type="text" 
                        placeholder="Search topics..." 
                        className="w-full pl-10 pr-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-xs font-bold text-white outline-none focus:ring-1 focus:ring-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {filteredTopics.map((topic) => (
                    <div key={topic.id} className={cn(
                        "bg-gray-950/50 border rounded-3xl p-5 flex justify-between items-start group transition-all shadow-inner",
                        topic.status === 'MASTERED' ? "border-green-500/30 bg-green-500/5" : "border-gray-800 hover:bg-gray-800/40"
                    )}>
                       <div className="space-y-1">
                          <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{topic.courseCode} Node</div>
                          <div className={cn("text-sm font-black italic break-words line-clamp-2 pr-4", topic.status === 'MASTERED' ? "text-green-400" : "text-white")}>
                            {topic.title}
                          </div>
                          {topic.lastStudiedAt && (
                              <div className="flex items-center gap-2 text-[9px] font-bold text-gray-700 mt-2">
                                 <Clock className="w-3 h-3" /> Seen {new Date(topic.lastStudiedAt).toLocaleDateString()}
                              </div>
                          )}
                       </div>
                       <button 
                        onClick={() => toggleMastery(topic.id, topic.status)}
                        className={cn(
                            "p-3 rounded-xl transition-all shadow-xl active:scale-95",
                            topic.status === 'MASTERED' ? "bg-green-600 text-white" : "bg-gray-900 border border-gray-800 text-gray-700 hover:text-white hover:border-indigo-500"
                        )}
                       >
                          {topic.status === 'MASTERED' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                       </button>
                    </div>
                 ))}
                 
                 {filteredTopics.length === 0 && (
                    <div className="col-span-full py-32 text-center border-2 border-dashed border-gray-800 rounded-[2.5rem] opacity-30">
                        <p className="text-xs font-black text-gray-600 uppercase tracking-[0.4em]">No Topics Discovered in this sector</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
