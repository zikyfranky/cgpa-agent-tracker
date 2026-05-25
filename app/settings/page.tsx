'use client';

import React, { useState, useEffect } from 'react';
import { Settings, User, Database, Save, Loader2, GraduationCap, School } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState({
    currentLevel: 300,
    currentSemester: 'Second Semester',
    targetCgpa: 3.5
  });

  useEffect(() => {
    fetch('/api/user-state')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setConfig({
            currentLevel: data.currentLevel || 300,
            currentSemester: data.currentSemester || 'Second Semester',
            targetCgpa: data.user?.targetCgpa || 3.5
          });
        }
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/user-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      window.dispatchEvent(new Event('user-state-updated'));
      alert('Academic anchor synchronized.');
    } catch (e) {
      alert('Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-white italic text-center">Syncing Identity...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32 pt-6 px-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
            <Settings className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Settings</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">System Configuration</p>
          </div>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-blue-500 active:scale-95 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? "Syncing Logic..." : "Save Configuration"}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] p-8 space-y-8 shadow-2xl">
          <div className="flex items-center gap-3 text-blue-500 mb-2">
            <User className="w-5 h-5" />
            <h2 className="text-sm font-black uppercase tracking-widest">Academic Profile</h2>
          </div>
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mb-2 ml-1">Full Name</label>
              <input type="text" value="Isaac Frank" readOnly className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white text-sm font-bold opacity-70 cursor-not-allowed"/>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mb-2 ml-1">Matric Number</label>
              <input type="text" value="2023/1/94364PH" readOnly className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white text-sm font-bold opacity-70 cursor-not-allowed"/>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mb-2 ml-1">Institution</label>
              <div className="flex items-center gap-3 bg-gray-950 border border-gray-800 rounded-xl px-4 py-3">
                <School className="w-4 h-4 text-blue-500" />
                <span className="text-white text-sm font-bold truncate">FUT Minna</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] p-8 space-y-8 shadow-2xl">
          <div className="flex items-center gap-3 text-blue-500 mb-2">
            <GraduationCap className="w-5 h-5" />
            <h2 className="text-sm font-black uppercase tracking-widest">Academic Anchor</h2>
          </div>
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mb-3 ml-1">Current Level</label>
              <select 
                value={config.currentLevel}
                onChange={(e) => setConfig({...config, currentLevel: parseInt(e.target.value)})}
                className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none transition-all"
              >
                {[100, 200, 300, 400, 500].map(lvl => (
                  <option key={lvl} value={lvl}>{lvl}L</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mb-3 ml-1">Active Semester</label>
              <select 
                value={config.currentSemester}
                onChange={(e) => setConfig({...config, currentSemester: e.target.value})}
                className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none transition-all"
              >
                <option value="First Semester">First Semester</option>
                <option value="Second Semester">Second Semester</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 text-blue-500 mb-6">
              <Database className="w-5 h-5" />
              <h2 className="text-sm font-black uppercase tracking-widest">System Engine</h2>
            </div>
            <div className="p-6 bg-gray-950 border border-gray-800 rounded-3xl space-y-4">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-tight flex justify-between">
                Scale: <span className="text-blue-500">FUTMinna 5.0</span>
              </p>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-tight flex justify-between">
                Status: <span className="text-green-500">Optimized</span>
              </p>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-tight flex justify-between">
                Uptime: <span className="text-white">Active</span>
              </p>
              <div className="pt-4 border-t border-gray-900 mt-2">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mb-2">Target CGPA</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={config.targetCgpa} 
                  onChange={(e) => setConfig({...config, targetCgpa: parseFloat(e.target.value)})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
          <p className="text-[9px] text-gray-600 font-bold uppercase leading-relaxed px-2 text-center">
            Warning: The Academic Anchor controls global filtering logic for Simulator and Registry views.
          </p>
        </div>
      </div>
    </div>
  );
}