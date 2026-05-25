import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function POST() {
  try {
    // Note: The agent will use this to trigger the backend python script
    await execPromise('/usr/bin/python3 /opt/hermes/scripts/cron/vision_gap_analysis.py');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}