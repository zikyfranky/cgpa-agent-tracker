'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, Search, CheckCircle2, Circle, Clock, ChevronRight, Layers, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function KnowledgeAtlas() {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCourse, setActiveDay] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/results').then(res => res.json()).then(data => {
        // Just checking API connectivity here, real data from topics
        setLoading(false);
    });
  }, []);

  const stats = { mastered: 2, total: 322, percent: 0.6 };

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

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 flex items-center gap-10 shadow-xl">
           <div className="space-y-1">
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest block">Mastery Progress</span>
              <div className="flex items-center gap-3">
                 <div className="text-3xl font-black text-white italic">{stats.percent}%</div>
                 <div className="w-32 h-2 bg-gray-950 rounded-full overflow-hidden border border-gray-800">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${stats.percent}%` }}></div>
                 </div>
              </div>
           </div>
           <div className="h-10 w-px bg-gray-800"></div>
           <div>
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest block">Total Chapters</span>
              <div className="text-2xl font-black text-white">{stats.total}</div>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
           <div className="flex items-center gap-3 mb-4 px-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              <h2 className="text-xs font-black text-white uppercase tracking-widest">Active Curriculum</h2>
           </div>
           {['GPH312', 'GPH321', 'GPH308', 'ENT312', 'GST312'].map(code => (
             <button key={code} className="w-full text-left p-5 rounded-2xl bg-gray-900 border border-gray-800 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group flex justify-between items-center shadow-lg">
                <span className="font-black text-white italic tracking-tight">{code}</span>
                <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-indigo-500" />
             </button>
           ))}
        </div>

        <div className="lg:col-span-3 space-y-6">
           <div className="relative group overflow-hidden rounded-[2.5rem] bg-gray-900 border border-gray-800 p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                 <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Topic Exploration</h3>
                 </div>
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600" />
                    <input type="text" placeholder="Search Atlas..." className="pl-8 pr-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-[10px] font-bold text-white outline-none focus:ring-1 focus:ring-indigo-500 w-48"/>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {[1,2,3,4].map(i => (
                    <div key={i} className="bg-gray-950/50 border border-gray-800 rounded-3xl p-5 flex justify-between items-start group hover:bg-gray-800/40 transition-all cursor-pointer shadow-inner">
                       <div className="space-y-1">
                          <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Module {i}</div>
                          <div className="text-sm font-black text-white italic">Seismic Reflection Logic</div>
                          <div className="flex items-center gap-2 text-[9px] font-bold text-gray-700 mt-2">
                             <Clock className="w-3 h-3" /> Last read 2d ago
                          </div>
                       </div>
                       <button className="p-2 bg-gray-900 border border-gray-800 rounded-xl hover:bg-indigo-600 hover:border-indigo-500 transition-all">
                          <Circle className="w-4 h-4 text-gray-700 hover:text-white" />
                       </button>
                    </div>
                 ))}
                 <div className="col-span-full py-20 text-center border border-dashed border-gray-800 rounded-[2.5rem] opacity-50">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">Index mapping in progress...</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
