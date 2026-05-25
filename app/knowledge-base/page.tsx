'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  CheckCircle2, 
  Circle, 
  Clock, 
  ChevronRight, 
  Layers, 
  Target, 
  Loader2,
  X,
  ExternalLink,
  BookMarked,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function KnowledgeAtlas() {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<number>(300);
  const [selectedSemester, setSelectedSemester] = useState<string>('Second Semester');
  const [activeCourse, setActiveCourse] = useState<string | null>(null);
  const [readingTopic, setReadingTopic] = useState<any | null>(null);

  const levels = [100, 200, 300, 400, 500];
  const semesters = ['First Semester', 'Second Semester'];

  useEffect(() => {
    fetch('/api/user-state')
      .then(res => res.json())
      .then(state => {
        if (state) {
          setSelectedLevel(state.currentLevel);
          setSelectedSemester(state.currentSemester);
        }
        return fetch('/api/topics');
      })
      .then(res => res.json())
      .then(data => {
        setTopics(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch failed", err);
        setLoading(false);
      });
  }, []);

  const availableCourses = useMemo(() => {
    const courseSet = new Set(
      topics
        .filter(t => t.level === selectedLevel && t.semester === selectedSemester)
        .map(t => t.courseCode)
    );
    return Array.from(courseSet).sort();
  }, [topics, selectedLevel, selectedSemester]);

  useEffect(() => {
    if (availableCourses.length > 0) {
      if (!activeCourse || !availableCourses.includes(activeCourse)) {
        setActiveCourse(availableCourses[0]);
      }
    } else {
      setActiveCourse(null);
    }
  }, [availableCourses, activeCourse]);

  const toggleMastery = async (e: React.MouseEvent, id: string, currentStatus: string) => {
    e.stopPropagation();
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
      t.level === selectedLevel &&
      t.semester === selectedSemester &&
      t.courseCode === activeCourse && 
      t.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [topics, activeCourse, searchTerm, selectedLevel, selectedSemester]);

  const stats = useMemo(() => {
    const total = topics.length;
    const mastered = topics.filter(t => t.status === 'MASTERED').length;
    return {
      total,
      mastered,
      percent: total > 0 ? ((mastered / total) * 100).toFixed(1) : 0
    };
  }, [topics]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white gap-4 bg-[#050505]">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      <div className="font-black uppercase italic tracking-widest animate-pulse">Syncing Learning Nodes...</div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-32 px-4 pt-6">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl rotate-3">
            <BookOpen className="w-8 h-8 text-white -rotate-3" />
          </div>
          <div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">Knowledge Atlas</h1>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-2">Personal Compounding Engine v2.0</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-gray-900/50 border border-gray-800 p-2 rounded-2xl backdrop-blur-xl">
            <div className="flex gap-1">
                {levels.map(l => (
                    <button 
                        key={l}
                        onClick={() => setSelectedLevel(l)}
                        className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black transition-all",
                            selectedLevel === l ? "bg-indigo-600 text-white shadow-lg" : "text-gray-500 hover:text-white"
                        )}
                    >
                        {l}L
                    </button>
                ))}
            </div>
            <div className="w-px h-6 bg-gray-800 mx-2"></div>
            <select 
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="bg-transparent text-[10px] font-black text-white uppercase outline-none cursor-pointer pr-4"
            >
                {semesters.map(s => <option key={s} value={s} className="bg-gray-900">{s}</option>)}
            </select>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-gray-900 border border-gray-800 rounded-[2rem] p-8 flex items-center justify-between shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
              <div className="space-y-2">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block italic">Synergy Level</span>
                  <div className="text-6xl font-black text-white italic leading-none">{stats.percent}%</div>
              </div>
              <div className="flex flex-col items-end gap-4">
                  <div className="text-right">
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest block text-right">Mastered Nodes</span>
                      <div className="text-2xl font-black text-white">{stats.mastered} <span className="text-gray-700">/ {stats.total}</span></div>
                  </div>
                  <div className="w-48 h-3 bg-gray-950 rounded-full overflow-hidden border border-gray-800">
                    <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${stats.percent}%` }}></div>
                  </div>
              </div>
          </div>
          <div className="bg-indigo-600 rounded-[2rem] p-8 shadow-2xl flex flex-col justify-center items-center text-center group cursor-pointer hover:bg-indigo-500 transition-colors">
              <Target className="w-10 h-10 text-white mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-[10px] font-black text-white/50 uppercase tracking-widest">Next Milestone</div>
              <div className="text-lg font-black text-white uppercase text-center break-words">Finish {activeCourse || `${selectedLevel}L`}</div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
           <div className="flex items-center gap-3 mb-2 px-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              <h2 className="text-xs font-black text-white uppercase tracking-widest italic">Curriculum</h2>
           </div>
           <div className="space-y-2 overflow-y-auto max-h-[60vh] no-scrollbar pr-2 pt-2">
            {availableCourses.map(code => (
                <button 
                    key={code} 
                    onClick={() => setActiveCourse(code)}
                    className={cn(
                        "w-full text-left p-5 rounded-2xl border transition-all group flex justify-between items-center shadow-lg relative overflow-hidden",
                        activeCourse === code 
                            ? "bg-gray-900 border-indigo-500 text-white" 
                            : "bg-[#0a0a0a] border-gray-900 text-gray-500 hover:border-gray-700"
                    )}
                >
                    {activeCourse === code && <div className="absolute left-0 top-0 w-1 h-full bg-indigo-500"></div>}
                    <div className="flex flex-col">
                        <span className="font-black italic tracking-tighter text-lg">{code}</span>
                        <span className="text-[9px] font-bold uppercase text-gray-600 group-hover:text-gray-400">Core Module</span>
                    </div>
                    <ChevronRight className={cn("w-4 h-4 transition-transform", activeCourse === code ? "text-indigo-500 translate-x-1" : "text-gray-800")} />
                </button>
            ))}
           </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
           <div className="relative overflow-hidden rounded-[3rem] bg-gray-950 border border-gray-900 p-1 shadow-2xl min-h-[70vh]">
              <div className="bg-gray-900 rounded-[2.8rem] p-8 h-full min-h-[70vh]">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-gray-800/50">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center">
                            <BookMarked className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white italic tracking-tight uppercase leading-none">{activeCourse || 'Select Course'}</h3>
                            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-1">Compound Knowledge Sectors</p>
                        </div>
                    </div>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                        <input 
                            type="text" 
                            placeholder="Filter topics..." 
                            className="w-full pl-12 pr-6 py-4 bg-gray-950 border border-gray-800 rounded-2xl text-xs font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all placeholder:text-gray-800"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTopics.map((topic) => (
                        <div 
                            key={topic.id} 
                            onClick={() => setReadingTopic(topic)}
                            className={cn(
                                "group cursor-pointer bg-[#0c0c0c] border rounded-[2rem] p-6 flex justify-between items-center transition-all hover:scale-[1.02] active:scale-100",
                                topic.status === 'MASTERED' ? "border-green-500/20 bg-green-500/5" : "border-gray-800 hover:border-indigo-500/40"
                            )}
                        >
                        <div className="space-y-1 flex-1 pr-4">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={cn(
                                    "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter",
                                    topic.status === 'MASTERED' ? "bg-green-500/20 text-green-400" : "bg-indigo-500/20 text-indigo-400"
                                )}>
                                    {topic.status === 'MASTERED' ? 'Complete' : 'Pending'}
                                </span>
                                {topic.sourceFile && <div className="text-[8px] font-bold text-gray-700 truncate max-w-[100px]">{topic.sourceFile.split('/').pop()}</div>}
                            </div>
                            <div className={cn("text-sm font-black italic tracking-tight line-clamp-2 leading-snug group-hover:text-indigo-400 transition-colors uppercase", topic.status === 'MASTERED' ? "text-green-500/80" : "text-white")}>
                                {topic.title}
                            </div>
                        </div>
                        <button 
                            onClick={(e) => toggleMastery(e, topic.id, topic.status)}
                            className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                                topic.status === 'MASTERED' ? "bg-green-600 text-white" : "bg-gray-950 border border-gray-800 text-gray-700 group-hover:border-indigo-500 group-hover:text-indigo-500"
                            )}
                        >
                            {topic.status === 'MASTERED' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                        </button>
                        </div>
                    ))}
                    
                    {filteredTopics.length === 0 && (
                        <div className="col-span-full py-40 text-center border-2 border-dashed border-gray-800 rounded-[3rem] group">
                            <Filter className="w-12 h-12 text-gray-800 mx-auto mb-4 group-hover:text-indigo-500/50 transition-colors" />
                            <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.5em]">No Knowledge Nodes Found</p>
                        </div>
                    )}
                </div>
              </div>
           </div>
        </div>
      </div>

      {readingTopic && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 drop-shadow-2xl">
              <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setReadingTopic(null)}></div>
              <div className="relative w-full max-w-4xl max-h-[85vh] bg-gray-900 border border-indigo-500/30 rounded-[3rem] shadow-[0_0_100px_rgba(79,70,229,0.2)] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
                  <div className="p-8 border-b border-gray-800 flex justify-between items-start">
                      <div className="space-y-4 max-w-[80%]">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-lg uppercase italic tracking-tighter">Level node</span>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{readingTopic.courseCode} Sector</span>
                        </div>
                        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-tight">{readingTopic.title}</h2>
                        {readingTopic.sourceFile && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-950 rounded-xl border border-gray-800 text-[10px] font-bold text-gray-400">
                                <ExternalLink className="w-3 h-3 text-indigo-500" />
                                <span className="text-gray-600 uppercase tracking-widest">Source:</span> {readingTopic.sourceFile.split('/').pop()}
                            </div>
                        )}
                      </div>
                      <button 
                        onClick={() => setReadingTopic(null)}
                        className="p-3 bg-gray-950 border border-gray-800 text-gray-500 hover:text-white hover:border-red-500/50 rounded-2xl transition-all"
                      >
                          <X className="w-5 h-5" />
                      </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-10 prose prose-invert prose-indigo max-w-none no-scrollbar">
                      {readingTopic.content ? (
                          <div className="text-gray-300 leading-relaxed font-medium whitespace-pre-wrap selection:bg-indigo-500/30 selection:text-white">
                              {readingTopic.content}
                          </div>
                      ) : (
                          <div className="py-20 text-center space-y-6">
                              <div className="w-16 h-16 bg-gray-950 rounded-full flex items-center justify-center mx-auto border border-gray-800">
                                <Search className="w-8 h-8 text-gray-700" />
                              </div>
                              <div>
                                <p className="text-lg font-black text-white uppercase italic">{readingTopic.id.startsWith("GHOST") ? "No Study Material Linked" : "Content Extraction Pending"}</p>
                                <p className="text-xs text-gray-600 font-bold uppercase tracking-widest mt-2">{readingTopic.id.startsWith("GHOST") ? "The folder structure exists but no lecture notes, PDFs or docs were detected in this sector." : "Analysis engine failed to compound text blocks for this node"}</p>
                              </div>
                          </div>
                      )}
                  </div>

                  <div className="p-8 bg-gray-950 border-t border-gray-800 flex justify-between items-center">
                       <button 
                        onClick={() => setReadingTopic(null)}
                        className="px-6 py-3 text-xs font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors"
                       >
                           Dismiss
                       </button>
                       <button 
                        onClick={(e) => {
                            toggleMastery(e, readingTopic.id, readingTopic.status);
                            setReadingTopic(null);
                        }}
                        className={cn(
                            "px-8 py-4 rounded-2xl flex items-center gap-3 font-black text-xs uppercase italic tracking-tight transition-all shadow-2xl",
                            readingTopic.status === 'MASTERED' 
                                ? "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white" 
                                : "bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105"
                        )}
                       >
                           {readingTopic.status === 'MASTERED' ? (
                               <>
                                <Circle className="w-4 h-4" /> Mark Unmastered Nodes
                               </>
                           ) : (
                               <>
                                <CheckCircle2 className="w-4 h-4" /> Commit to Mastery
                               </>
                           )}
                       </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
