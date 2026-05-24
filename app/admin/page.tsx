"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';

export default function AdminCatalog() {
  const [catalog, setCatalog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/records")
      .then((res) => res.json())
      .then((data) => {
        if (data.catalog) setCatalog(data.catalog);
        setLoading(false);
      });
  }, []);

  const saveCatalog = async () => {
    setIsSaving(true);
    await fetch("/api/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: 'catalog_update', catalog }),
    });
    setIsSaving(false);
    alert("Catalog updated successfully!");
  };

  if (loading) return <div className="p-8">Loading catalog...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-4 md:p-8 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <Link href="/" className="text-sm text-blue-600 hover:underline">← Back to Dashboard</Link>
            <h1 className="text-3xl font-bold mt-2">Catalog Editor</h1>
          </div>
          <button 
            onClick={saveCatalog}
            disabled={isSaving}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </header>

        <section className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Global Max Units</label>
              <input 
                type="number"
                className="w-full bg-zinc-50 dark:bg-zinc-800 p-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={catalog.globalMaxUnits}
                onChange={(e) => setCatalog({...catalog, globalMaxUnits: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Global Min Units</label>
              <input 
                type="number"
                className="w-full bg-zinc-50 dark:bg-zinc-800 p-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={catalog.globalMinUnits}
                onChange={(e) => setCatalog({...catalog, globalMinUnits: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold border-b border-zinc-100 dark:border-zinc-800 pb-2">Course Structure</h3>
            <textarea 
               className="w-full h-[500px] font-mono text-xs bg-zinc-50 dark:bg-zinc-800 p-4 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
               value={JSON.stringify(catalog.levels, null, 2)}
               onChange={(e) => {
                 try {
                   const newLevels = JSON.parse(e.target.value);
                   setCatalog({...catalog, levels: newLevels});
                 } catch (err) {
                   // Silence JSON parse errors while typing
                 }
               }}
            />
            <p className="text-[10px] text-zinc-500 italic">Editing the Levels/Semesters as raw JSON for speed and accuracy. Ensure total units align with university regulations.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
