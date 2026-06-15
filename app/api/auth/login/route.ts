import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email } = data;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Authenticate user by name and email (case-insensitive for email)
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
        name: {
          equals: name,
          mode: 'insensitive', // Assuming name should also be case-insensitive for easier login
        }
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials. User not found.' },
        { status: 401 }
      );
    }

    // Set simple cookie session (flexible for later changes)
    const cookieStore = await cookies();
    cookieStore.set('session_userId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
