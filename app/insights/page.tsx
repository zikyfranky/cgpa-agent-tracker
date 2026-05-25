'use client';

import React, { useState, useEffect } from 'react';
import { Lightbulb, TrendingUp, Target, Loader2, Play, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function InsightPage() {
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [insight, setInsight] = useState<any>(null);

  const fetchInsight = async () => {
    try {
      const res = await fetch('/api/insights');
      const data = await res.json();
      setInsight(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight();
  }, []);

  const runAnalysis = async () => {
    setRunning(true);
    try {
      await fetch('/api/insights/run', { method: 'POST' });
      await fetchInsight();
    } catch (e) {
      alert('Analysis failed');
    } finally {
      setRunning(false);
    }
  };

  if (loading) return <div className="p-20 text-white italic text-center">Harvesting Intelligence...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 pt-6 px-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-900/40">
            <Lightbulb className="w-7 h-7 text-black" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Insights</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Growth & Projection Logic</p>
          </div>
        </div>
        
        <button 
          onClick={runAnalysis}
          disabled={running}
          className="px-8 py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-gray-200 active:scale-95 disabled:opacity-50"
        >
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
          {running ? "Analyzing Data..." : "Run Analysis"}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] p-8 space-y-4">
          <div className="flex items-center gap-3 text-amber-500">
            <Target className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">Projection Gap</span>
          </div>
          <div className="flex items-end gap-4">
            <div className="text-6xl font-black text-white italic">{insight?.gap}</div>
            <div className="pb-2 text-xs font-bold text-gray-500 uppercase tracking-tighter leading-tight">
              Points needed for <span className="text-white">{insight?.targetCgpa}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] p-8 space-y-4">
          <div className="flex items-center gap-3 text-blue-500">
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">Current Status</span>
          </div>
          <div className="flex items-end gap-4">
            <div className="text-6xl font-black text-white italic">{insight?.currentCgpa}</div>
            <div className="pb-2 text-xs font-bold text-gray-500 uppercase tracking-tighter leading-tight">
              CGPA verified as of <span className="text-white">{insight?.semester}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-[3rem] p-10 space-y-8">
         <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
             <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">AI Recommendations</h2>
         </div>
         <div className="space-y-4">
            {insight?.recommendations?.map((rec: string, i: number) => (
                <div key={i} className="flex gap-6 p-6 bg-gray-950 border border-gray-800 rounded-3xl group hover:border-amber-500/30 transition-all">
                    <div className="mt-1">
                        <CheckCircle className="w-5 h-5 text-amber-500" />
                    </div>
                    <p className="text-sm font-bold text-gray-300 leading-relaxed italic">{rec}</p>
                </div>
            ))}
         </div>
         
         <div className="pt-6 border-t border-gray-800">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center">
                Next scheduled analysis: <span className="text-white">{new Date(new Date(insight?.lastUpdated).getTime() + 5 * 60 * 60 * 1000).toLocaleTimeString()}</span>
            </p>
         </div>
      </div>
    </div>
  );
}