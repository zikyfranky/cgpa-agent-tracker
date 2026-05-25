'use client';

import React, { useState, useEffect } from 'react';
import { Settings, User, Database, Save, Loader2, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState({
    currentLevel: 300,
    currentSemester: 'Second Semester'
  });

  useEffect(() => {
    fetch('/api/results') // Using results to check current DB state or we can create a dedicated config API
      .then(() => {
        // Placeholder for real state fetch
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    // In a real app, this would hit /api/user/state
    setTimeout(() => {
      setIsSaving(false);
      alert('Academic persistence updated.');
    }, 1000);
  };

  if (loading) return <div className="p-20 text-white italic">Loading Configurations...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 pt-6 px-4">
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
          {isSaving ? "Updating..." : "Save Configuration"}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none"
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
                className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none"
              >
                <option value="First Semester">First Semester</option>
                <option value="Second Semester">Second Semester</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
          <div className="flex items-center gap-3 text-blue-500 mb-2">
            <Database className="w-5 h-5" />
            <h2 className="text-sm font-black uppercase tracking-widest">System Engine</h2>
          </div>
          <div className="p-6 bg-gray-950 border border-gray-800 rounded-3xl">
            <p className="text-xs text-gray-400 leading-relaxed font-bold uppercase tracking-tight">
              Grading Scale: <span className="text-blue-500">FUTMinna 5.0</span><br/>
              Status: <span className="text-green-500">Active</span><br/>
              Identity: <span className="text-white">Isaac Frank</span>
            </p>
          </div>
          <p className="text-[9px] text-gray-600 font-bold uppercase leading-relaxed px-2">
            Warning: Changing your academic anchor affects the filtering across Registry and Simulator pages.
          </p>
        </div>
      </div>
    </div>
  );
}
