     1|'use client';
     2|
     3|import React, { useState, useEffect } from 'react';
     4|import { 
     5|Calendar, 
     6|Clock, 
     7|MapPin, 
     8|Plus, 
     9|Trash2, 
    10|Save, 
    11|X,
    12|Loader2,
    13|AlertCircle
    14|} from 'lucide-react';
    15|import { cn } from '@/lib/utils';
    16|
    17|export default function TimetablePage() {
    18|const [events, setEvents] = useState<any[]>([]);
    19|const [loading, setLoading] = useState(true);
    20|const [isSaving, setIsSaving] = useState(false);
    21|const [activeDay, setActiveDay] = useState('Monday');
    22|
    23|const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    24|
    25|useEffect(() => {
    26|fetch('/api/timetable')
    27|.then(res => res.json())
    28|.then(data => {
    29|setEvents(data);
    30|setLoading(false);
    31|});
    32|}, []);
    33|
    34|const handleAdd = () => {
    35|const newEvent = {
    36|id: null,
    37|userId: 'ISAAC-001', // Standardized for this project
    38|courseCode: 'COURSE',
    39|day: activeDay,
    40|startTime: '09:00',
    41|endTime: '11:00',
    42|location: 'LAB'
    43|};
    44|setEvents([...events, newEvent]);
    45|};
    46|
    47|const handleUpdate = (tempId: number | string, updates: any) => {
    48|setEvents(prev => prev.map((e, idx) => (e.id === tempId || idx === tempId) ? { ...e, ...updates } : e));
    49|};
    50|
    51|const handleSync = async () => {
    52|setIsSaving(true);
    53|try {
    54|for (const event of events) {
    55|await fetch('/api/timetable', {
    56|method: 'POST',
    57|headers: { 'Content-Type': 'application/json' },
    58|body: JSON.stringify(event)
    59|});
    60|}
    61|setIsSaving(false);
    62|alert('Timetable synced to Google Calendar (Future events only).');
    63|} catch (e) {
    64|alert('Sync failed');
    65|setIsSaving(false);
    66|}
    67|};
    68|
    69|const handleDelete = async (id: string, index: number) => {
    70|if (!id) {
    71|setEvents(events.filter((_, i) => i !== index));
    72|return;
    73|}
    74|if (confirm('Delete this event?')) {
    75|await fetch('/api/timetable', {
    76|method: 'POST',
    77|headers: { 'Content-Type': 'application/json' },
    78|body: JSON.stringify({ id, action: 'DELETE' })
    79|});
    80|setEvents(events.filter(e => e.id !== id));
    81|}
    82|};
    83|
    84|if (loading) return <div className="p-20 text-center text-white italic">Wiring Schedule...</div>;
    85|
    86|return (
    <>
    <style>{`
      input[type="time"]::-webkit-calendar-picker-indicator { display: none; -webkit-appearance: none; }
    `}</style>
    87|<div className="max-w-7xl mx-auto space-y-12 pb-32 px-4 pt-6">
    88|<header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-6">
    89|<div className="flex items-center gap-2 sm:gap-3">
    90|<div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
    91|<Calendar className="w-7 h-7 text-white" />
    92|</div>
    93|<div>
    94|<h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Timetable</h1>
    95|<p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Live Sync with Google Calendar</p>
    96|</div>
    97|</div>
    98|
    99|<div className="flex gap-4">
   100|<button 
   101|onClick={handleSync}
   102|disabled={isSaving}
   103|className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-blue-500 active:scale-95 disabled:opacity-50"
   104|>
   105|{isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
   106|{isSaving ? "Syncing Logic..." : "Sync to Calendar"}
   107|</button>
   108|</div>
   109|</header>
   110|
   111|<div className="flex bg-gray-950 p-2 rounded-2xl border border-gray-800 shadow-xl overflow-x-auto no-scrollbar gap-2">
   112|{days.map(day => (
   113|<button
   114|key={day}
   115|onClick={() => setActiveDay(day)}
   116|className={cn(
   117|"px-8 py-4 rounded-xl text-[12px] font-black transition-all uppercase tracking-widest shrink-0",
   118|activeDay === day ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-white"
   119|)}
   120|>
   121|{day}
   122|</button>
   123|))}
   124|</div>
   125|
   126|<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
   127|{events.filter(e => e.day === activeDay).map((event, idx) => (
   128|<div key={event.id || idx} className="bg-gray-900 border border-gray-800 rounded-[2.5rem] p-8 space-y-6 group hover:border-blue-500/50 transition-all shadow-xl">
   129|<div className="flex justify-between items-start">
   130|<input 
   131|type="text" 
   132|className="bg-transparent text-2xl font-black text-white italic uppercase tracking-tighter w-full outline-none focus:text-blue-500 transition-colors"
   133|value={event.courseCode}
   134|onChange={(e) => handleUpdate(event.id || idx, { courseCode: e.target.value })}
   135|/>
   136|<button onClick={() => handleDelete(event.id, idx)} className="p-2 text-gray-600 hover:text-red-500 transition-colors">
   137|<Trash2 className="w-4 h-4" />
   138|</button>
   139|</div>
   140|
   141|<div className="space-y-4">
   142|<div className="flex items-center gap-2 sm:gap-3">
   143|<div className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 flex items-center gap-2">
   144|<Clock className="w-4 h-4 text-blue-400 shrink-0" />
   145|<input 
   146|type="time" 
   147|className="bg-transparent text-xs font-black text-white outline-none w-full"
   148|value={event.startTime}
   149|onChange={(e) => handleUpdate(event.id || idx, { startTime: e.target.value })}
   150|/>
   151|</div>
   152|<div className="text-[10px] font-black text-gray-800 shrink-0">TO</div>
   153|<div className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 flex items-center gap-2">
   154|<Clock className="w-4 h-4 text-blue-400 shrink-0" />
   155|<input 
   156|type="time" 
   157|className="bg-transparent text-xs font-black text-white outline-none w-full"
   158|value={event.endTime}
   159|onChange={(e) => handleUpdate(event.id || idx, { endTime: e.target.value })}
   160|/>
   161|</div>
   162|</div>
   163|
   164|<div className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-4 flex items-center gap-3">
   165|<MapPin className="w-4 h-4 text-blue-400 shrink-0" />
   166|<input 
   167|type="text" 
   168|placeholder="Location (e.g. LT1)"
   169|className="bg-transparent text-xs font-black text-white outline-none w-full uppercase"
   170|value={event.location || ''}
   171|onChange={(e) => handleUpdate(event.id || idx, { location: e.target.value })}
   172|/>
   173|</div>
   174|</div>
   175|</div>
   176|))}
   177|
   178|<button 
   179|onClick={handleAdd}
   180|className="border-2 border-dashed border-gray-800 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-3 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-gray-600 hover:text-blue-500"
   181|>
   182|<Plus className="w-8 h-8" />
   183|<span className="text-[10px] font-black uppercase tracking-widest">Add Encounter</span>
   184|</button>
   185|</div>
   186|
   187|<div className="bg-blue-600/5 border border-blue-600/10 rounded-[2rem] p-6 flex items-start gap-4 shadow-inner">
   188|<AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
   189|<p className="text-[10px] text-gray-500 font-bold leading-relaxed uppercase tracking-widest">
   190|Sync Logic: This creates recurring events on your <span className="text-white underline">FUTMX</span> Calendar. Changes only apply to <span className="text-white">FUTURE</span> occurrences. Past attendance data remains immutable.
   191|</p>
   192|</div>
   193|</div>
   194|);
   195|}
   196|