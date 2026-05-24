import CGPACalculator from "./components/CGPACalculator";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-4 md:p-8">
      <main className="max-w-xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Isaac Core Growth
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Personal academic accountability and CGPA tracking for Isaac Frank. 
            Aiming for 3.5+ CGPA to support international relocation.
          </p>
        </header>

        <section>
          <CGPACalculator />
        </section>

        <section className="grid grid-cols-1 gap-4">
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Semester Focus</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              300L Second Semester (Applied Geophysics). Focus on Seismic Methods and Geophysical Data Processing.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
