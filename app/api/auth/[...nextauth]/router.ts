
import { NextResponse } from 'next/server';

// This API route is a stub for backend implementation (PostgreSQL).
// Backend team: implement real authentication logic here.

export async function POST(request: Request) {
  return NextResponse.json(
    { error: 'Not implemented. Backend should handle login.' },
    { status: 501 }
  );
}

export async function GET() {
  return NextResponse.json(
    { error: 'Not implemented. Backend should handle auth status.' },
    { status: 501 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Not implemented. Backend should handle logout.' },
    { status: 501 }
  );
}
