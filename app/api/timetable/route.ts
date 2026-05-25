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
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, courseCode, day, startTime, endTime, location, userId, action } = body;

    if (action === 'DELETE') {
      await prisma.timetable.delete({ where: { id } });
    } else if (id) {
      await prisma.timetable.update({
        where: { id },
        data: { courseCode, day, startTime, endTime, location }
      });
    } else {
      await prisma.timetable.create({
        data: { userId, courseCode, day, startTime, endTime, location }
      });
    }

    // Trigger Python sync script in the background
    // This script will only sync future/current events as per user requirement
    const syncScript = path.join(process.cwd(), 'scripts/sync_google_calendar.py');
    exec(`python3 ${syncScript}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
