import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const insight = await prisma.insight.findFirst();

    if (!insight) {
      return NextResponse.json({
        lastUpdated: new Date().toISOString(),
        currentCgpa: 3.40,
        targetCgpa: 3.50,
        gap: 0.10,
        semester: "Harnessing Analysis...",
        recommendations: ["Database connection initiated. Click 'Run Analysis' to hydrate data."]
      });
    }

    return NextResponse.json({
      ...insight,
      recommendations: JSON.parse(insight.recommendations)
    });
  } catch (error: any) {
    console.error("GET INSIGHTS ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
