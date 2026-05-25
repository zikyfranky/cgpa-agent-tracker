'use client';

import React, { useState, useEffect } from 'react';
import { 
Calendar, 
Clock, 
MapPin, 
Plus, 
Trash2, 
Save, 
X,
Loader2,
AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TimetablePage() {
const [events, setEvents] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
const [isSaving, setIsSaving] = useState(false);
const [activeDay, setActiveDay] = useState('Monday');

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

useEffect(() => {
fetch('/api/timetable')
.then(res => res.json())
.then(data => {
setEvents(data);
setLoading(false);
});
}, []);

const handleAdd = () => {
const newEvent = {
id: null,
userId: 'ISAAC-001', // Standardized for this project
courseCode: 'COURSE',
day: activeDay,
startTime: '09:00',
endTime: '11:00',
location: 'LAB'
};
setEvents([...events, newEvent]);
};

const handleUpdate = (tempId: number | string, updates: any) => {
setEvents(prev => prev.map((e, idx) => (e.id === tempId || idx === tempId) ? { ...e, ...updates } : e));
};

const handleSync = async () => {
setIsSaving(true);
try {
for (const event of events) {
await fetch('/api/timetable', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(event)
});
}
setIsSaving(false);
alert('Timetable synced to Google Calendar (Future events only).');
} catch (e) {
alert('Sync failed');
setIsSaving(false);
}
};

const handleDelete = async (id: string, index: number) => {
if (!id) {
setEvents(events.filter((_, i) => i !== index));
return;
}
if (confirm('Delete this event?')) {
await fetch('/api/timetable', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ id, action: 'DELETE' })
});
setEvents(events.filter(e => e.id !== id));
}
};

if (loading) return <div className="p-20 text-center text-white italic">Wiring Schedule...</div>;

return (
<div className="max-w-7xl mx-auto space-y-12 pb-32 px-4 pt-6">
<header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-6">
<div className="flex items-center gap-2 sm:gap-3">
<div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
<Calendar className="w-7 h-7 text-white" />
</div>
<div>
<h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Timetable</h1>
<p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Live Sync with Google Calendar</p>
</div>
</div>

<div className="flex gap-4">
<button 
onClick={handleSync}
disabled={isSaving}
className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-blue-500 active:scale-95 disabled:opacity-50"
>
{isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
{isSaving ? "Syncing Logic..." : "Sync to Calendar"}
</button>
</div>
</header>

<div className="flex bg-gray-950 p-2 rounded-2xl border border-gray-800 shadow-xl overflow-x-auto no-scrollbar gap-2">
{days.map(day => (
<button
key={day}
onClick={() => setActiveDay(day)}
className={cn(
"px-8 py-4 rounded-xl text-[12px] font-black transition-all uppercase tracking-widest shrink-0",
activeDay === day ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-white"
)}
>
{day}
</button>
))}
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
{events.filter(e => e.day === activeDay).map((event, idx) => (
<div key={event.id || idx} className="bg-gray-900 border border-gray-800 rounded-[2.5rem] p-8 space-y-6 group hover:border-blue-500/50 transition-all shadow-xl">
<div className="flex justify-between items-start">
<input 
type="text" 
className="bg-transparent text-2xl font-black text-white italic uppercase tracking-tighter w-full outline-none focus:text-blue-500 transition-colors"
value={event.courseCode}
onChange={(e) => handleUpdate(event.id || idx, { courseCode: e.target.value })}
/>
<button onClick={() => handleDelete(event.id, idx)} className="p-2 text-gray-600 hover:text-red-500 transition-colors">
<Trash2 className="w-4 h-4" />
</button>
</div>

<div className="space-y-4">
<div className="flex items-center gap-2 sm:gap-3">
<div className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 flex items-center gap-2">
<Clock className="w-4 h-4 text-blue-400 shrink-0" />
<input 
type="time" 
className="bg-transparent text-xs font-black text-white outline-none w-full"
value={event.startTime}
onChange={(e) => handleUpdate(event.id || idx, { startTime: e.target.value })}
/>
</div>
<div className="text-[10px] font-black text-gray-800 shrink-0">TO</div>
<div className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 flex items-center gap-2">
<Clock className="w-4 h-4 text-blue-400 shrink-0" />
<input 
type="time" 
className="bg-transparent text-xs font-black text-white outline-none w-full"
value={event.endTime}
onChange={(e) => handleUpdate(event.id || idx, { endTime: e.target.value })}
/>
</div>
</div>

<div className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-4 flex items-center gap-3">
<MapPin className="w-4 h-4 text-blue-400 shrink-0" />
<input 
type="text" 
placeholder="Location (e.g. LT1)"
className="bg-transparent text-xs font-black text-white outline-none w-full uppercase"
value={event.location || ''}
onChange={(e) => handleUpdate(event.id || idx, { location: e.target.value })}
/>
</div>
</div>
</div>
))}

<button 
onClick={handleAdd}
className="border-2 border-dashed border-gray-800 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-3 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-gray-600 hover:text-blue-500"
>
<Plus className="w-8 h-8" />
<span className="text-[10px] font-black uppercase tracking-widest">Add Encounter</span>
</button>
</div>

<div className="bg-blue-600/5 border border-blue-600/10 rounded-[2rem] p-6 flex items-start gap-4 shadow-inner">
<AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
<p className="text-[10px] text-gray-500 font-bold leading-relaxed uppercase tracking-widest">
Sync Logic: This creates recurring events on your <span className="text-white underline">FUTMX</span> Calendar. Changes only apply to <span className="text-white">FUTURE</span> occurrences. Past attendance data remains immutable.
</p>
</div>
</div>
);
}
