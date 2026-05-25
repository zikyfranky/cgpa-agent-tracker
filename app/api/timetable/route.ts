import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import path from 'path';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const events = await prisma.timetable.findMany({
      orderBy: { day: 'asc' }
    });
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, courseCode, day, startTime, endTime, location, action } = body;

    // Standard User for Isaac
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ error: 'No user found' }, { status: 404 });

    if (action === 'DELETE') {
      await prisma.timetable.delete({ where: { id } });
    } else {
      // Manual Upsert Logic
      if (id && !id.startsWith('temp-')) {
        await prisma.timetable.update({
          where: { id },
          data: { courseCode, day, startTime, endTime, location }
        });
      } else {
        await prisma.timetable.create({
          data: { 
            userId: user.id, 
            courseCode, 
            day, 
            startTime, 
            endTime, 
            location 
          }
        });
      }
    }

    // Trigger Python sync script in the background
    const syncScript = path.join(process.cwd(), 'scripts/sync_google_calendar.py');
    exec(`python3 ${syncScript}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed operation' }, { status: 500 });
  }
}
