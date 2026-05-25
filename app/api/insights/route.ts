import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const INSIGHT_PATH = '/opt/data/projects/cgpa-agent-tracker/data/insights.json';

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    const dataRaw = await fs.readFile(INSIGHT_PATH, 'utf-8');
    const insightData = JSON.parse(dataRaw);

    console.log("Insight JSON content:", insightData);

    // Calculate dynamic gap based on live DB target
    const target = user?.targetCgpa || 3.5;
    const current = insightData.currentCgpa || 3.4;

    const finalResponse = {
      ...insightData,
      currentCgpa: current,
      targetCgpa: target,
      gap: parseFloat((target - current).toFixed(2))
    };

    console.log("Returning dynamic response:", finalResponse);
    return NextResponse.json(finalResponse);
  } catch (error: any) {
    console.error("GET INSIGHTS ERROR:", error.message);
    // Default fallback
    return NextResponse.json({
        lastUpdated: new Date().toISOString(),
        currentCgpa: 3.40,
        targetCgpa: 3.50,
        gap: 0.10,
        semester: "Error Fetching Data",
        recommendations: ["Error reading insights.json: " + error.message]
    });
  }
}