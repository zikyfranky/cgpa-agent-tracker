import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const state = await prisma.userState.findFirst({
      include: { user: true }
    });
    return NextResponse.json(state);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { currentLevel, currentSemester, targetCgpa } = body;
    
    // Find first user (Isaac)
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ error: 'No user' }, { status: 404 });

    // Update target CGPA if provided
    if (targetCgpa !== undefined) {
      await prisma.user.update({
        where: { id: user.id },
        data: { targetCgpa: parseFloat(targetCgpa.toString()) }
      });
    }

    const state = await prisma.userState.upsert({
      where: { userId: user.id },
      update: { currentLevel, currentSemester },
      create: { userId: user.id, currentLevel, currentSemester }
    });
    
    return NextResponse.json(state);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
