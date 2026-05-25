import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const INSIGHT_PATH = '/opt/data/projects/cgpa-agent-tracker/data/insights.json';

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    const insightData = await fs.readFile(INSIGHT_PATH, 'utf-8').then(JSON.parse).catch(() => ({}));

    // Calculate dynamic gap based on live DB target
    const target = user?.targetCgpa || 3.5;
    const current = insightData.currentCgpa || 3.4;

    return NextResponse.json({
      ...insightData,
      currentCgpa: current,
      targetCgpa: target,
      gap: parseFloat((target - current).toFixed(2))
    });
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