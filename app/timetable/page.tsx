     1|'use client';
     2|
     3|import React, { useState, useEffect } from 'react';
     4|import { 
     5|  Calendar, 
     6|  Clock, 
     7|  MapPin, 
     8|  Plus, 
     9|  Trash2, 
    10|  Save, 
    11|  X,
    12|  Loader2,
    13|  AlertCircle
    14|} from 'lucide-react';
    15|import { cn } from '@/lib/utils';
    16|
    17|export default function TimetablePage() {
    18|  const [events, setEvents] = useState<any[]>([]);
    19|  const [loading, setLoading] = useState(true);
    20|  const [isSaving, setIsSaving] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
    21|  const [activeDay, setActiveDay] = useState('Monday');
    22|
    23|  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    24|
    25|  useEffect(() => {
    26|    fetch('/api/timetable')
    27|      .then(res => res.json())
    28|      .then(data => {
    29|        setEvents(data);
    30|        setLoading(false);
    31|      });
    32|  }, []);
    33|
    34|  const handleAdd = () => {
    35|    const newEvent = {
    36|      id: null,
    37|      userId: 'ISAAC-001',
    38|      courseCode: 'COURSE',
    39|      day: activeDay,
    40|      startTime: '09:00',
    41|      endTime: '11:00',
    42|      location: 'LAB'
    43|    };
    44|    setEvents([...events, newEvent]);
    45|  };
    46|
    47|  const handleUpdate = (tempId: number | string, updates: any) => {
    48|    setEvents(prev => prev.map((e, idx) => (e.id === tempId || idx === tempId) ? { ...e, ...updates } : e));
    49|  };
    50|
    51|  const handleSync = async () => {
    52|    setIsSaving(true);
    53|    try {
    54|      for (const event of events) {
    55|        await fetch('/api/timetable', {
    56|          method: 'POST',
    57|          headers: { 'Content-Type': 'application/json' },
    58|          body: JSON.stringify(event)
    59|        });
    60|      }
    61|      setIsSaving(false);
    62|      alert('Timetable synced to Google Calendar (Future events only).');
    63|    } catch (e) {
    64|      alert('Sync failed');
    65|      setIsSaving(false);
    66|    }
    67|  };
    68|
    69|  const handleDelete = async (id: string, index: number) => {
    70|    if (!id) {
    71|        setEvents(events.filter((_, i) => i !== index));
    72|        return;
    73|    }
    74|    if (confirm('Delete this event?')) {
    75|      await fetch('/api/timetable', {
    76|        method: 'POST',
    77|        headers: { 'Content-Type': 'application/json' },
    78|        body: JSON.stringify({ id, action: 'DELETE' })
    79|      });
    80|      setEvents(events.filter(e => e.id !== id));
    81|    }
    82|  };
    83|
    84|  if (loading) return (
    85|    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
    86|      <div className="w-10 h-10 border-t-2 border-blue-500 rounded-full animate-spin"></div>
    87|      <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Wiring Schedule...</p>
    88|    </div>
    89|  );
    90|
    91|  return (
    92|    <div className="max-w-7xl mx-auto space-y-12 pb-32 px-4 pt-6">
    93|      <style dangerouslySetInnerHTML={{ __html: `
    94|        input[type="time"]::-webkit-calendar-picker-indicator { display: none !important; -webkit-appearance: none !important; }
    95|      `}} />
    96|      
    97|      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-6">
    98|        <div className="flex items-center gap-4">
    99|          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
   100|            <Calendar className="w-7 h-7 text-white" />
   101|          </div>
   102|          <div>
   103|            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Timetable</h1>
   104|            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Live Sync with Google Calendar</p>
   105|          </div>
   106|        </div>
   107|
   108|        <div className="flex gap-4">
   109|            <button 
   110|                onClick={handleSync}
   111|                disabled={isSaving}
   112|                className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-blue-500 active:scale-95 disabled:opacity-50"
   113|            >
   114|                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
   115|                {isSaving ? "Syncing Logic..." : "Sync to Calendar"}
   116|            </button>
   117|        </div>
   118|      </header>
   119|
   120|      <div className="flex bg-gray-950 p-2 rounded-2xl border border-gray-800 shadow-xl overflow-x-auto no-scrollbar gap-2">
   121|         {days.map(day => (
   122|           <button
   123|             key={day}
   124|             onClick={() => setActiveDay(day)}
   125|             className={cn(
   126|               "px-8 py-4 rounded-xl text-[12px] font-black transition-all uppercase tracking-widest shrink-0",
   127|               activeDay === day ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-white"
   128|             )}
   129|           >
   130|             {day}
   131|           </button>
   132|         ))}
   133|      </div>
   134|
   135|      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
   136|         {events.filter(e => e.day === activeDay).map((event, idx) => (
   137|           <div key={event.id || idx} className="bg-gray-900 border border-gray-800 rounded-[2.5rem] p-8 space-y-6 group hover:border-blue-500/50 transition-all shadow-xl">
   138|              <div className="flex justify-between items-start">
   139|                 <input 
   140|                    type="text" 
   141|                    className="bg-transparent text-2xl font-black text-white italic uppercase tracking-tighter w-full outline-none focus:text-blue-500 transition-colors"
   142|                    value={event.courseCode}
   143|                    onChange={(e) => handleUpdate(event.id || idx, { courseCode: e.target.value })}
   144|                 />
   145|                 <button onClick={() => handleDelete(event.id, idx)} className="p-2 text-gray-600 hover:text-red-500 transition-colors">
   146|                    <Trash2 className="w-4 h-4" />
   147|                 </button>
   148|              </div>
   149|
   150|              <div className="space-y-4">
   151|                 <div className="flex items-center gap-2 sm:gap-3">
   152|                    <div className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 flex items-center gap-2">
   153|                        <Clock className="w-4 h-4 text-blue-400 shrink-0" />
   154|                        <input 
   155|                            type="time" 
   156|                            className="bg-transparent text-xs font-black text-white outline-none w-full"
   157|                            value={event.startTime}
   158|                            onChange={(e) => handleUpdate(event.id || idx, { startTime: e.target.value })}
   159|                        />
   160|                    </div>
   161|                    <div className="text-[10px] font-black text-gray-800 shrink-0">TO</div>
   162|                    <div className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 flex items-center gap-2">
   163|                        <Clock className="w-4 h-4 text-blue-400 shrink-0" />
   164|                        <input 
   165|                            type="time" 
   166|                            className="bg-transparent text-xs font-black text-white outline-none w-full"
   167|                            value={event.endTime}
   168|                            onChange={(e) => handleUpdate(event.id || idx, { endTime: e.target.value })}
   169|                        />
   170|                    </div>
   171|                 </div>
   172|
   173|                 <div className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-4 flex items-center gap-3">
   174|                     <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
   175|                     <input 
   176|                        type="text" 
   177|                        placeholder="Location (e.g. LT1)"
   178|                        className="bg-transparent text-xs font-black text-white outline-none w-full uppercase"
   179|                        value={event.location || ''}
   180|                        onChange={(e) => handleUpdate(event.id || idx, { location: e.target.value })}
   181|                     />
   182|                 </div>
   183|              </div>
   184|           </div>
   185|         ))}
   186|
   187|         <button 
   188|            onClick={handleAdd}
   189|            className="border-2 border-dashed border-gray-800 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-3 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-gray-600 hover:text-blue-500"
   190|         >
   191|            <Plus className="w-8 h-8" />
   192|            <span className="text-[10px] font-black uppercase tracking-widest">Add Encounter</span>
   193|         </button>
   194|      </div>
   195|
   196|      <div className="bg-blue-600/5 border border-blue-600/10 rounded-[2rem] p-6 flex items-start gap-4 shadow-inner">
   197|         <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
   198|         <p className="text-[10px] text-gray-500 font-bold leading-relaxed uppercase tracking-widest">
   199|            Sync Logic: This creates recurring events on your <span className="text-white underline">FUTMX</span> Calendar. Changes only apply to <span className="text-white">FUTURE</span> occurrences. Past attendance data remains immutable.
   200|         </p>
   201|      </div>
   202|    </div>
   203|  );
   204|}
   205|