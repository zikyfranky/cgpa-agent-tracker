     1|'use client';
     2|import React, { useState, useEffect, useMemo } from 'react';
     3|import { 
     4|  BookOpen, 
     5|  Search, 
     6|  CheckCircle2, 
     7|  Circle, 
     8|  Clock, 
     9|  ChevronRight, 
    10|  Layers, 
    11|  Target, 
    12|  Loader2,
    13|  X,
    14|  ExternalLink,
    15|  BookMarked,
    16|  Filter
    17|} from 'lucide-react';
    18|import { cn } from '@/lib/utils';
    19|
    20|export default function KnowledgeAtlas() {
    21|  const [topics, setTopics] = useState<any[]>([]);
    22|  const [loading, setLoading] = useState(true);
    23|  const [searchTerm, setSearchTerm] = useState('');
    24|  const [selectedLevel, setSelectedLevel] = useState<number>(300);
    25|  const [selectedSemester, setSelectedSemester] = useState<string>('Second Semester');
    26|  const [activeCourse, setActiveCourse] = useState<string | null>(null);
    27|  const [readingTopic, setReadingTopic] = useState<any | null>(null);
    28|
    29|  // Levels and Semesters constant
    30|  const levels = [100, 200, 300, 400, 500];
    31|  const semesters = ['First Semester', 'Second Semester'];
    32|
    33|  useEffect(() => {
    34|    // 1. Fetch User Settings first
    35|    fetch('/api/user-state')
    36|      .then(res => res.json())
    37|      .then(state => {
    38|        if (state) {
    39|          setSelectedLevel(state.currentLevel);
    40|          setSelectedSemester(state.currentSemester);
    41|        }
    42|        // 2. Fetch Topics
    43|        return fetch('/api/topics');
    44|      })
    45|      .then(res => res.json())
    46|      .then(data => {
    47|        setTopics(data);
    48|        setLoading(false);
    49|      })
    50|      .catch(err => {
    51|        console.error("Fetch failed", err);
    52|        setLoading(false);
    53|      });
    54|  }, []);
    55|
    56|  // Filter Courses based on Level/Semester would ideally come from a Result/Registrations table
    57|  // But here we derive from the topics themselves if possible, or usually we'd have a course list.
    58|  // For the crawler, we stored courseCode. 
    59|  // Let's assume courses exist if topics exist for them.
    60|  const availableCourses = useMemo(() => {
    61|    const courseSet = new Set(
    62|      topics
    63|        .filter(t => t.level === selectedLevel && t.semester === selectedSemester)
    64|        .map(t => t.courseCode)
    65|    );
    66|    return Array.from(courseSet).sort();
    67|  }, [topics, selectedLevel, selectedSemester]);
    68|
    69|  // If no active course or level/sem changed and course no longer valid, pick first
    70|  useEffect(() => {
    71|    if (availableCourses.length > 0) {
    72|      if (!activeCourse || !availableCourses.includes(activeCourse)) {
    73|        setActiveCourse(availableCourses[0]);
    74|      }
    75|    } else {
    76|      setActiveCourse(null);
    77|    }
    78|  }, [availableCourses, activeCourse]);
    79|
    80|  const toggleMastery = async (e: React.MouseEvent, id: string, currentStatus: string) => {
    81|    e.stopPropagation();
    82|    const newStatus = currentStatus === 'MASTERED' ? 'UNSEEN' : 'MASTERED';
    83|    setTopics(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    84|    
    85|    await fetch('/api/topics', {
    86|      method: 'POST',
    87|      headers: { 'Content-Type': 'application/json' },
    88|      body: JSON.stringify({ id, status: newStatus })
    89|    });
    90|  };
    91|
    92|  const filteredTopics = useMemo(() => {
    93|    return topics.filter(t => 
    94|      t.level === selectedLevel &&
    95|      t.semester === selectedSemester &&
    96|      t.courseCode === activeCourse && 
    97|      t.title.toLowerCase().includes(searchTerm.toLowerCase())
    98|    );
    99|  }, [topics, activeCourse, searchTerm, selectedLevel, selectedSemester]);
   100|
   101|  const stats = useMemo(() => {
   102|    const total = topics.length;
   103|    const mastered = topics.filter(t => t.status === 'MASTERED').length;
   104|    return {
   105|      total,
   106|      mastered,
   107|      percent: total > 0 ? ((mastered / total) * 100).toFixed(1) : 0
   108|    };
   109|  }, [topics]);
   110|
   111|  if (loading) return (
   112|    <div className="flex flex-col items-center justify-center min-h-screen text-white gap-4 bg-[#050505]">
   113|      <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
   114|      <div className="font-black uppercase italic tracking-widest animate-pulse">Syncing Learning Nodes...</div>
   115|    </div>
   116|  );
   117|
   118|  return (
   119|    <div className="max-w-7xl mx-auto space-y-10 pb-32 px-4 pt-6">
   120|      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-6">
   121|        <div className="flex items-center gap-4">
   122|          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl rotate-3">
   123|            <BookOpen className="w-8 h-8 text-white -rotate-3" />
   124|          </div>
   125|          <div>
   126|            <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">Knowledge Atlas</h1>
   127|            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-2">Personal Compounding Engine v2.0</p>
   128|          </div>
   129|        </div>
   130|
   131|        {/* Level/Semester Selectors */}
   132|        <div className="flex items-center gap-3 bg-gray-900/50 border border-gray-800 p-2 rounded-2xl backdrop-blur-xl">
   133|            <div className="flex gap-1">
   134|                {levels.map(l => (
   135|                    <button 
   136|                        key={l}
   137|                        onClick={() => setSelectedLevel(l)}
   138|                        className={cn(
   139|                            "px-4 py-2 rounded-xl text-[10px] font-black transition-all",
   140|                            selectedLevel === l ? "bg-indigo-600 text-white shadow-lg" : "text-gray-500 hover:text-white"
   141|                        )}
   142|                    >
   143|                        {l}L
   144|                    </button>
   145|                ))}
   146|            </div>
   147|            <div className="w-px h-6 bg-gray-800 mx-2"></div>
   148|            <select 
   149|                value={selectedSemester}
   150|                onChange={(e) => setSelectedSemester(e.target.value)}
   151|                className="bg-transparent text-[10px] font-black text-white uppercase outline-none cursor-pointer pr-4"
   152|            >
   153|                {semesters.map(s => <option key={s} value={s} className="bg-gray-900">{s}</option>)}
   154|            </select>
   155|        </div>
   156|      </header>
   157|
   158|      {/* Global Mastery Tracker */}
   159|      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
   160|          <div className="md:col-span-2 bg-gray-900 border border-gray-800 rounded-[2rem] p-8 flex items-center justify-between shadow-2xl relative overflow-hidden">
   161|              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
   162|              <div className="space-y-2">
   163|                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block italic">Synergy Level</span>
   164|                  <div className="text-6xl font-black text-white italic leading-none">{stats.percent}%</div>
   165|              </div>
   166|              <div className="flex flex-col items-end gap-4">
   167|                  <div className="text-right">
   168|                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest block text-right">Mastered Nodes</span>
   169|                      <div className="text-2xl font-black text-white">{stats.mastered} <span className="text-gray-700">/ {stats.total}</span></div>
   170|                  </div>
   171|                  <div className="w-48 h-3 bg-gray-950 rounded-full overflow-hidden border border-gray-800">
   172|                    <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${stats.percent}%` }}></div>
   173|                  </div>
   174|              </div>
   175|          </div>
   176|          <div className="bg-indigo-600 rounded-[2rem] p-8 shadow-2xl flex flex-col justify-center items-center text-center group cursor-pointer hover:bg-indigo-500 transition-colors">
   177|              <Target className="w-10 h-10 text-white mb-2 group-hover:scale-110 transition-transform" />
   178|              <div className="text-[10px] font-black text-white/50 uppercase tracking-widest">Next Milestone</div>
   179|              <div className="text-lg font-black text-white uppercase text-center break-words">Finish {activeCourse || `${selectedLevel}L`}</div>
   180|          </div>
   181|      </div>
   182|
   183|      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
   184|        {/* Course Sidebar */}
   185|        <div className="lg:col-span-1 space-y-4">
   186|           <div className="flex items-center gap-3 mb-2 px-2">
   187|              <Layers className="w-4 h-4 text-indigo-500" />
   188|              <h2 className="text-xs font-black text-white uppercase tracking-widest italic">Curriculum</h2>
   189|           </div>
   190|           <div className="space-y-2 overflow-y-auto max-h-[60vh] no-scrollbar pr-2 pt-2">
   191|            {availableCourses.map(code => (
   192|                <button 
   193|                    key={code} 
   194|                    onClick={() => setActiveCourse(code)}
   195|                    className={cn(
   196|                        "w-full text-left p-5 rounded-2xl border transition-all group flex justify-between items-center shadow-lg relative overflow-hidden",
   197|                        activeCourse === code 
   198|                            ? "bg-gray-900 border-indigo-500 text-white" 
   199|                            : "bg-[#0a0a0a] border-gray-900 text-gray-500 hover:border-gray-700"
   200|                    )}
   201|                >
   202|                    {activeCourse === code && <div className="absolute left-0 top-0 w-1 h-full bg-indigo-500"></div>}
   203|                    <div className="flex flex-col">
   204|                        <span className="font-black italic tracking-tighter text-lg">{code}</span>
   205|                        <span className="text-[9px] font-bold uppercase text-gray-600 group-hover:text-gray-400">Core Module</span>
   206|                    </div>
   207|                    <ChevronRight className={cn("w-4 h-4 transition-transform", activeCourse === code ? "text-indigo-500 translate-x-1" : "text-gray-800")} />
   208|                </button>
   209|            ))}
   210|           </div>
   211|        </div>
   212|
   213|        {/* Main Content Area */}
   214|        <div className="lg:col-span-3 space-y-6">
   215|           <div className="relative overflow-hidden rounded-[3rem] bg-gray-950 border border-gray-900 p-1 shadow-2xl min-h-[70vh]">
   216|              <div className="bg-gray-900 rounded-[2.8rem] p-8 h-full min-h-[70vh]">
   217|                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-gray-800/50">
   218|                    <div className="flex items-center gap-4">
   219|                        <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center">
   220|                            <BookMarked className="w-5 h-5 text-indigo-500" />
   221|                        </div>
   222|                        <div>
   223|                            <h3 className="text-xl font-black text-white italic tracking-tight uppercase leading-none">{activeCourse || 'Select Course'}</h3>
   224|                            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-1">Compound Knowledge Sectors</p>
   225|                        </div>
   226|                    </div>
   227|                    <div className="relative w-full sm:w-72">
   228|                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
   229|                        <input 
   230|                            type="text" 
   231|                            placeholder="Filter topics..." 
   232|                            className="w-full pl-12 pr-6 py-4 bg-gray-950 border border-gray-800 rounded-2xl text-xs font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all placeholder:text-gray-800"
   233|                            value={searchTerm}
   234|                            onChange={(e) => setSearchTerm(e.target.value)}
   235|                        />
   236|                    </div>
   237|                </div>
   238|
   239|                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
   240|                    {filteredTopics.map((topic) => (
   241|                        <div 
   242|                            key={topic.id} 
   243|                            onClick={() => setReadingTopic(topic)}
   244|                            className={cn(
   245|                                "group cursor-pointer bg-[#0c0c0c] border rounded-[2rem] p-6 flex justify-between items-center transition-all hover:scale-[1.02] active:scale-100",
   246|                                topic.status === 'MASTERED' ? "border-green-500/20 bg-green-500/5" : "border-gray-800 hover:border-indigo-500/40"
   247|                            )}
   248|                        >
   249|                        <div className="space-y-1 flex-1 pr-4">
   250|                            <div className="flex items-center gap-2 mb-1">
   251|                                <span className={cn(
   252|                                    "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter",
   253|                                    topic.status === 'MASTERED' ? "bg-green-500/20 text-green-400" : "bg-indigo-500/20 text-indigo-400"
   254|                                )}>
   255|                                    {topic.status === 'MASTERED' ? 'Complete' : 'Pending'}
   256|                                </span>
   257|                                {topic.sourceFile && <div className="text-[8px] font-bold text-gray-700 truncate max-w-[100px]">{topic.sourceFile.split('/').pop()}</div>}
   258|                            </div>
   259|                            <div className={cn("text-sm font-black italic tracking-tight line-clamp-2 leading-snug group-hover:text-indigo-400 transition-colors uppercase", topic.status === 'MASTERED' ? "text-green-500/80" : "text-white")}>
   260|                                {topic.title}
   261|                            </div>
   262|                        </div>
   263|                        <button 
   264|                            onClick={(e) => toggleMastery(e, topic.id, topic.status)}
   265|                            className={cn(
   266|                                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
   267|                                topic.status === 'MASTERED' ? "bg-green-600 text-white" : "bg-gray-950 border border-gray-800 text-gray-700 group-hover:border-indigo-500 group-hover:text-indigo-500"
   268|                            )}
   269|                        >
   270|                            {topic.status === 'MASTERED' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
   271|                        </button>
   272|                        </div>
   273|                    ))}
   274|                    
   275|                    {filteredTopics.length === 0 && (
   276|                        <div className="col-span-full py-40 text-center border-2 border-dashed border-gray-800 rounded-[3rem] group">
   277|                            <Filter className="w-12 h-12 text-gray-800 mx-auto mb-4 group-hover:text-indigo-500/50 transition-colors" />
   278|                            <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.5em]">No Knowledge Nodes Found</p>
   279|                        </div>
   280|                    )}
   281|                </div>
   282|              </div>
   283|           </div>
   284|        </div>
   285|      </div>
   286|
   287|      {/* Reading Modal */}
   288|      {readingTopic && (
   289|          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 drop-shadow-2xl">
   290|              <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setReadingTopic(null)}></div>
   291|              <div className="relative w-full max-w-4xl max-h-[85vh] bg-gray-900 border border-indigo-500/30 rounded-[3rem] shadow-[0_0_100px_rgba(79,70,229,0.2)] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
   292|                  {/* Modal Header */}
   293|                  <div className="p-8 border-b border-gray-800 flex justify-between items-start">
   294|                      <div className="space-y-4 max-w-[80%]">
   295|                        <div className="flex items-center gap-3">
   296|                            <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-lg uppercase italic tracking-tighter">Level node</span>
   297|                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{readingTopic.courseCode} Sector</span>
   298|                        </div>
   299|                        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-tight">{readingTopic.title}</h2>
   300|                        {readingTopic.sourceFile && (
   301|                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-950 rounded-xl border border-gray-800 text-[10px] font-bold text-gray-400">
   302|                                <ExternalLink className="w-3 h-3 text-indigo-500" />
   303|                                <span className="text-gray-600 uppercase tracking-widest">Source:</span> {readingTopic.sourceFile.split('/').pop()}
   304|                            </div>
   305|                        )}
   306|                      </div>
   307|                      <button 
   308|                        onClick={() => setReadingTopic(null)}
   309|                        className="p-3 bg-gray-950 border border-gray-800 text-gray-500 hover:text-white hover:border-red-500/50 rounded-2xl transition-all"
   310|                      >
   311|                          <X className="w-5 h-5" />
   312|                      </button>
   313|                  </div>
   314|
   315|                  {/* Modal Content */}
   316|                  <div className="flex-1 overflow-y-auto p-10 prose prose-invert prose-indigo max-w-none no-scrollbar">
   317|                      {readingTopic.content ? (
   318|                          <div className="text-gray-300 leading-relaxed font-medium whitespace-pre-wrap selection:bg-indigo-500/30 selection:text-white">
   319|                              {readingTopic.content}
   320|                          </div>
   321|                      ) : (
   322|                          <div className="py-20 text-center space-y-6">
   323|                              <div className="w-16 h-16 bg-gray-950 rounded-full flex items-center justify-center mx-auto border border-gray-800">
   324|                                <Search className="w-8 h-8 text-gray-700" />
   325|                              </div>
   326|                              <div>
   327|                                <p className="text-lg font-black text-white uppercase italic">{readingTopic.id.startsWith("GHOST") ? "No Study Material Linked" : "Content Extraction Pending"}</p>
   328|                                <p className="text-xs text-gray-600 font-bold uppercase tracking-widest mt-2">{readingTopic.id.startsWith("GHOST") ? "The folder structure exists but no lecture notes, PDFs or docs were detected in this sector." : "Analysis engine failed to compound text blocks for this node"}</p>
   329|                              </div>
   330|                          </div>
   331|                      )}
   332|                  </div>
   333|
   334|                  {/* Modal Footer */}
   335|                  <div className="p-8 bg-gray-950 border-t border-gray-800 flex justify-between items-center">
   336|                       <button 
   337|                        onClick={() => setReadingTopic(null)}
   338|                        className="px-6 py-3 text-xs font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors"
   339|                       >
   340|                           Dismiss
   341|                       </button>
   342|                       <button 
   343|                        onClick={(e) => {
   344|                            toggleMastery(e, readingTopic.id, readingTopic.status);
   345|                            setReadingTopic(null);
   346|                        }}
   347|                        className={cn(
   348|                            "px-8 py-4 rounded-2xl flex items-center gap-3 font-black text-xs uppercase italic tracking-tight transition-all shadow-2xl",
   349|                            readingTopic.status === 'MASTERED' 
   350|                                ? "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white" 
   351|                                : "bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105"
   352|                        )}
   353|                       >
   354|                           {readingTopic.status === 'MASTERED' ? (
   355|                               <>
   356|                                <Circle className="w-4 h-4" /> Mark Unmastered Nodes
   357|                               </>
   358|                           ) : (
   359|                               <>
   360|                                <CheckCircle2 className="w-4 h-4" /> Commit to Mastery
   361|                               </>
   362|                           )}
   363|                       </button>
   364|                  </div>
   365|              </div>
   366|          </div>
   367|      )}
   368|    </div>
   369|  );
   370|}
   371|