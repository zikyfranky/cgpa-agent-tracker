import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function POST() {
  try {
    // Exact absolute path to ensure execution from the web runner
    const scriptPath = './scripts/vision_gap_analysis.py';
    await execPromise('/usr/bin/python3 ' + scriptPath);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("ANALYSIS RUN ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}