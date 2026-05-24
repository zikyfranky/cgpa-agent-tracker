import * as fs from 'fs';
import * as path from 'path';
import { NextResponse } from 'next/server';

const DATA_FILE = path.join(process.cwd(), 'data', 'academic_records.json');
const CATALOG_FILE = path.join(process.cwd(), 'data', 'courses_catalog.json');

export async function GET() {
  try {
    let records = { courses: [], previousGPA: 3.19, previousCredits: 100 };
    if (fs.existsSync(DATA_FILE)) {
      records = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }

    let catalog = {};
    if (fs.existsSync(CATALOG_FILE)) {
      catalog = JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf8'));
    }

    return NextResponse.json({ ...records, catalog });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { courses, previousGPA, previousCredits } = body;
    const dataDir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify({ courses, previousGPA, previousCredits }, null, 2));
    return NextResponse.json({ message: 'Saved successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
