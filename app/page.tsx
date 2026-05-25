'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  ArrowUpRight, 
  Calendar as CalendarIcon,
  Target,
  Zap
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart, 
  Area
} from 'recharts';
import { cn } from '@/lib/utils';
import { calculateGPA, getClassification } from '@/lib/logic/engine';

const Dashboard = () => {
  const [results, setResults] = useState<any[]>([]);
  const [anchor, setAnchor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/user-state').then(res => res.json()),
      fetch('/api/results').then(res => res.json())
    ]).then(([stateData, resData]) => {
      setAnchor(stateData);
      setResults(resData);
      setLoading(false);
    });
  }, []);

  // GPA logic using the anchor from Settings
  const cgpa = calculateGPA(results, anchor);
  const standing = getClassification(cgpa);
  
  // Calculate GPA per semester for the chart
  const semesterStats = results.reduce((acc: any, curr: any) => {
    if (curr.grade === 'PENDING') return acc;
    const key = `${curr.level}L ${curr.semester === 'First Semester' ? 'S1' : 'S2'}`;
    if (!acc[key]) acc[key] = { qp: 0, units: 0 };
    acc[key].qp += (curr.units * (curr.gradePoint || 0));
    acc[key].units += curr.units;
    return acc;
  }, {});

  const gpaHistory = Object.entries(semesterStats).map(([sem, stats]: [string, any]) => ({
    semester: sem,
    gpa: parseFloat((stats.qp / stats.units).toFixed(2))
  })).sort((a, b) => a.semester.localeCompare(b.semester));

  const carryovers = results.filter(r => r.grade === 'F');

  if (loading) return <div className="p-20 text-center text-gray-500 font-black tracking-widest uppercase animate-pulse italic">Syncing Mission Control...</div>;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden border border-blue-400/20">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/10">
                    <Zap className="w-5 h-5 text-blue-300" />
                </div>
                <h1 className="text-lg font-bold text-blue-100 uppercase tracking-widest">Isaac's Mission Control</h1>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-8">
              <div className="space-y-1">
                <div className="text-7xl font-black tracking-tighter drop-shadow-2xl">{cgpa.toFixed(2)}</div>
                <div className="text-blue-200 text-xs font-black uppercase tracking-[0.2em] ml-1">Cumulative GPA</div>
              </div>
              
              <div className="h-10 w-px bg-white/10 hidden md:block mb-4"></div>

              <div className="space-y-1 pb-1">
                 <div className="text-2xl font-black tracking-tight drop-shadow-md text-white">
                    {standing?.name}
                 </div>
                 <div className="text-blue-300/50 text-[10px] font-black uppercase tracking-widest">Status up to {anchor?.currentLevel}L {anchor?.currentSemester === 'First Semester' ? 'S1' : 'S2'}</div>
              </div>
            </div>
            
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-6 border border-white/5 group hover:border-blue-400/30 transition-all cursor-pointer">
                <div className="text-blue-300/60 text-[10px] uppercase font-black tracking-widest mb-2">Relocation Target</div>
                <div className="flex justify-between items-end">
                    <div className="text-3xl font-black">3.50</div>
                    <div className="text-xs font-bold text-blue-400 group-hover:translate-x-1 transition-transform tracking-tight flex items-center gap-1">
                        +{(3.50 - cgpa).toFixed(2)} needed <ArrowUpRight className="w-3 h-3" />
                    </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute right-20 top-20 w-32 h-32 bg-indigo-400/10 rounded-full blur-2xl animate-pulse"></div>
        </div>

        <div className="bg-gray-900 rounded-[2.5rem] p-8 border border-gray-800 shadow-xl flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-8">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Next Encounter</span>
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-white mb-2 tracking-tighter italic uppercase group-hover:text-blue-500 transition-colors">GPH312</h3>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-tight">Electrical & Electromagnetic Methods</p>
            <div className="mt-6 flex flex-col gap-2">
                <div className="flex items-center gap-3 text-white font-black text-xs uppercase tracking-widest bg-gray-950 p-3 rounded-2xl border border-gray-800">
                    <CalendarIcon className="w-4 h-4 text-blue-500" />
                    <span>Monday @ 09:00 AM</span>
                </div>
            </div>
          </div>
          <Link href="/timetable" className="w-full mt-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-900/40">
             Audit Timetable <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-sm rounded-[2.5rem] border border-gray-800 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
                <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    Growth Velocity
                </h2>
                <p className="text-xs font-bold text-gray-600 mt-1 uppercase tracking-tight">Semester-over-semester projection</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={gpaHistory}>
                <defs>
                  <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis 
                  dataKey="semester" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#475569', fontSize: 10, fontWeight: 'bold'}}
                  dy={15}
                />
                <YAxis 
                  domain={[0, 5]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#475569', fontSize: 10, fontWeight: 'bold'}}
                />
                <Tooltip 
                  contentStyle={{backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #1e293b', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                  itemStyle={{color: '#fff', fontSize: '12px', fontWeight: '900'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="gpa" 
                  stroke="#2563eb" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorGpa)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900/40 border border-gray-800 rounded-[2.5rem] p-8">
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                <Target className="w-4 h-4 text-blue-500" />
                Trajectory
            </h2>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Completion</span>
                    <span className="text-lg font-black text-white italic">{( (results.filter(r => r.grade !== 'PENDING').length / results.length) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-950 rounded-full h-2 border border-gray-800 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)] transition-all duration-1000" style={{ width: `${(results.filter(r => r.grade !== 'PENDING').length / results.length) * 100}%` }}></div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
