import { NextResponse } from 'next/server';

const PASSWORD = 'rereeu';

export async function POST(request: Request) {
  const body = await request.json();
  const { password } = body;

  if (password === PASSWORD) {
    const response = NextResponse.json({ success: true });
    
    // Set cookie that expires in 7 days
    response.cookies.set('auth', PASSWORD, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  }

  return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
}
