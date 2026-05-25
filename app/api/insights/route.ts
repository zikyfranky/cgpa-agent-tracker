import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const INSIGHT_PATH = '/opt/data/projects/cgpa-agent-tracker/data/insights.json';

export async function GET() {
  try {
    const data = await fs.readFile(INSIGHT_PATH, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    // Default fallback
    return NextResponse.json({
        lastUpdated: new Date().toISOString(),
        currentCgpa: 3.40,
        targetCgpa: 3.50,
        gap: 0.10,
        semester: "300L Second Semester",
        recommendations: ["Database connection initiated. Click 'Run Analysis' to hydrate data."]
    });
  }
}