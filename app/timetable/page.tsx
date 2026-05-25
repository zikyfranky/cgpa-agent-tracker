'use client';

import React from 'react';
import { Calendar, Clock, MapPin, AlertCircle, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

const timetable = [
  { day: 'Monday', courses: [{ code: 'GPH312', time: '09:00 - 11:00', loc: 'LT1' }, { code: 'FUTM-GPH321', time: '11:00 - 13:00', loc: 'LT1' }] },
  { day: 'Tuesday', courses: [{ code: 'GPH308', time: '09:00 - 11:00', loc: 'LT1' }, { code: 'GPH322', time: '11:00 - 13:00', loc: 'LT1' }] },
  { day: 'Wednesday', courses: [{ code: 'GPH398', time: '09:00 - 11:00', loc: 'Field' }] },
  { day: 'Thursday', courses: [{ code: 'ENT312', time: '11:00 - 13:00', loc: 'ENT' }] },
];

const TimetablePage = () => {
  return (
    <div className="space-y-6 pb-20">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-8 h-8 text-blue-500" />
            FUTMX Timetable
          </h1>
          <p className="text-gray-400">Syncs directly with your Google Calendar.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-900/40 transition-all">
          <Save className="w-4 h-4" /> Save & Sync Fix
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
          const dayData = timetable.find(d => d.day === day);
          return (
            <div key={day} className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden flex flex-col">
              <div className="px-5 py-4 bg-gray-800/20 border-b border-gray-800">
                <span className="font-black text-gray-200 uppercase tracking-tighter">{day}</span>
              </div>
              <div className="p-4 flex-1 space-y-3">
                {dayData ? (
                  dayData.courses.map((c, i) => (
                    <div key={i} className="bg-gray-950 border border-gray-800 p-3 rounded-2xl group hover:border-blue-500/50 transition-colors">
                      <div className="text-sm font-black text-white group-hover:text-blue-400">{c.code}</div>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-1">
                        <Clock className="w-3 h-3" /> {c.time}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                        <MapPin className="w-3 h-3" /> {c.loc}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center py-8">
                     <span className="text-[10px] text-gray-700 font-bold uppercase tracking-widest">No Classes</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-900/10 border border-blue-900/20 rounded-3xl p-5 flex items-start gap-3">
         <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
         <p className="text-xs text-gray-400 leading-relaxed">
           Updating this timetable will automatically trigger a re-sync with your <span className="text-white font-bold">FUTMX Timetable</span> Google Calendar. Any manual changes there may be overwritten.
         </p>
      </div>
    </div>
  );
};

export default TimetablePage;
