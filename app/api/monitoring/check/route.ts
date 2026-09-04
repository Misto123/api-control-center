import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { 
      error: 'PROJECT DEPRECATED - All monitoring has been permanently disabled',
      deprecated: true,
      message: 'This API Control Center is no longer active. All automated processes have been stopped.'
    },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json(
    { 
      error: 'PROJECT DEPRECATED - All monitoring has been permanently disabled',
      deprecated: true,
      message: 'This API Control Center is no longer active. All automated processes have been stopped.'
    },
    { status: 410 }
  );
}
