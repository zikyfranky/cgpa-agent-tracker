'use client';

import React from 'react';
import { Settings, User, Bell, Shield, Database } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 pt-6">
      <header className="flex items-center gap-4">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
          <Settings className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Settings</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] p-8 space-y-6">
          <div className="flex items-center gap-3 text-blue-500 mb-2">
            <User className="w-5 h-5" />
            <h2 className="text-sm font-black uppercase tracking-widest">Academic Profile</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mb-2">Full Name</label>
              <input type="text" value="Isaac Frank" readOnly className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white text-sm font-bold"/>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mb-2">Institution</label>
              <input type="text" value="Federal University of Technology Minna" readOnly className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white text-sm font-bold"/>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] p-8 space-y-6">
          <div className="flex items-center gap-3 text-blue-500 mb-2">
            <Database className="w-5 h-5" />
            <h2 className="text-sm font-black uppercase tracking-widest">System Engine</h2>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed font-medium">
            Grading System: <span className="text-white font-bold">FUTMinna (5.0 Scale)</span><br/>
            Engine Status: <span className="text-green-500 font-bold">OPTIMIZED</span>
          </p>
          <button className="w-full py-4 bg-gray-950 border border-gray-800 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-white transition-all">
            Recalibrate All Quality Points
          </button>
        </div>
      </div>
    </div>
  );
}
