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
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const hydrate = async () => {
      try {
        const [stateRes, timetableRes, resultsRes] = await Promise.all([
          fetch('/api/user-state'),
          fetch('/api/timetable'),
          fetch('/api/results')
        ]);
        
        const stateData = await stateRes.json();
        const timetableData = await timetableRes.json();
        const resultsData = await resultsRes.json();

        setEvents(timetableData);
        
        const level = stateData?.currentLevel || 300;
        const semester = stateData?.currentSemester || 'Second Semester';
        const current = resultsData.filter((r: any) => 
          (r.level === level && r.semester === semester) || r.grade === 'F'
        );
        setAvailableCourses(current);
      } catch (err) {
        console.error("Hydration failed", err);
      } finally {
        setLoading(false);
      }
    };
    hydrate();
  }, []);

  const handleAdd = () => {
    const newEvent = {
      id: `temp-${Date.now()}`,
      userId: 'ISAAC-001',
      courseCode: '',
      day: activeDay,
      startTime: '09:00',
      endTime: '11:00',
      location: ''
    };
    setEvents([...events, newEvent]);
  };

  const handleUpdate = (id: string, updates: any) => {
    setEvents(prev => prev.map(e => {
      if (e.id !== id) return e;
      const newEvent = { ...e, ...updates };
      if (updates.startTime && newEvent.startTime >= newEvent.endTime) {
        const [h, m] = newEvent.startTime.split(':').map(Number);
        newEvent.endTime = `${String((h + 2) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      }
      if (updates.endTime && newEvent.endTime <= newEvent.startTime) {
        const [h, m] = newEvent.endTime.split(':').map(Number);
        newEvent.startTime = `${String(Math.max(0, h - 2)).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      }
      return newEvent;
    }));
  };

  const handleSync = async () => {
    setIsSaving(true);
    try {
      for (const event of events) {
        await fetch('/api/timetable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...event, action: 'UPSERT' })
        });
      }
      const res = await fetch('/api/timetable');
      const data = await res.json();
      setEvents(data);
      alert('SUCCESS: Academic schedule saved to local database.');
    } catch (e) {
      alert('Sync Failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (id.startsWith('temp-')) {
      setEvents(events.filter(e => e.id !== id));
      return;
    }
    if (confirm('Delete permanently?')) {
      await fetch('/api/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'DELETE' })
      });
      setEvents(events.filter(e => e.id !== id));
    }
  };

  if (loading) return <div className="p-20 text-center text-white font-black uppercase italic animate-pulse">Syncing Encounters...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-32 px-4 pt-6">
      <style dangerouslySetInnerHTML={{ __html: `
        input[type="time"]::-webkit-calendar-picker-indicator { display: none !important; -webkit-appearance: none !important; }
      `}} />
      
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
            <Calendar className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Timetable</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Unified Cloud Persistence</p>
          </div>
        </div>

        <button 
          onClick={handleSync}
          disabled={isSaving}
          className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-blue-500 active:scale-95 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? "Saving Identity..." : "Save Academic Schedule"}
        </button>
      </header>

      <div className="flex bg-gray-950 p-2 rounded-2xl border border-gray-800 shadow-xl overflow-auto no-scrollbar gap-2">
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
         {events.filter(e => e.day === activeDay).map((event) => (
           <div key={event.id} className="bg-gray-900 border border-gray-800 rounded-[2.5rem] p-8 space-y-6 hover:border-blue-500/50 transition-all shadow-xl">
              <div className="flex justify-between items-start">
                 <select 
                    className="bg-transparent text-2xl font-black text-white italic uppercase tracking-tighter w-full outline-none focus:text-blue-500 transition-colors cursor-pointer appearance-none"
                    value={event.courseCode}
                    onChange={(e) => handleUpdate(event.id, { courseCode: e.target.value })}
                 >
                    <option value="" disabled className="bg-gray-900 text-gray-500">Pick Course</option>
                    {availableCourses.map(c => (
                      <option key={c.id} value={c.courseCode} className="bg-gray-900 text-white">{c.courseCode} {c.grade === 'F' ? '(CO)' : ''}</option>
                    ))}
                    {!availableCourses.some(ac => ac.courseCode === event.courseCode) && event.courseCode && (
                       <option value={event.courseCode} className="bg-gray-900 text-white">{event.courseCode}</option>
                    )}
                 </select>
                 <button onClick={() => handleDelete(event.id)} className="p-2 text-gray-600 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                 </button>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                        <input type="time" className="bg-transparent text-xs font-black text-white outline-none w-full" value={event.startTime} onChange={(e) => handleUpdate(event.id, { startTime: e.target.value })}/>
                    </div>
                    <div className="text-[10px] font-black text-gray-800 shrink-0 uppercase italic">To</div>
                    <div className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-3 py-2.5 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                        <input type="time" className="bg-transparent text-xs font-black text-white outline-none w-full" value={event.endTime} onChange={(e) => handleUpdate(event.id, { endTime: e.target.value })}/>
                    </div>
                 </div>
                 <div className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-4 flex items-center gap-3">
                     <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                     <input type="text" placeholder="Location" className="bg-transparent text-xs font-black text-white outline-none w-full uppercase" value={event.location || ''} onChange={(e) => handleUpdate(event.id, { location: e.target.value })}/>
                 </div>
              </div>
           </div>
         ))}

         <button onClick={handleAdd} className="border-2 border-dashed border-gray-800 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-3 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-gray-600 hover:text-blue-500">
            <Plus className="w-8 h-8" />
            <span className="text-[10px] font-black uppercase tracking-widest">New Encounter</span>
         </button>
      </div>
    </div>
  );
}