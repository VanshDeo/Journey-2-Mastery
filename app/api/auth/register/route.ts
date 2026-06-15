import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        discord: data.discord,
        college: data.college,
        department: data.department,
        role: data.role,
        experience: data.experience,
        github: data.github,
        linkedin: data.linkedin,
        source: data.source,
        why: data.why,
        project: data.project,
      },
    });

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
    console.error('Registration Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
