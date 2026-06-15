import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('session_userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { teamId } = data;

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.teamId) {
      return NextResponse.json({ error: 'You are already in a team' }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId.toUpperCase() },
      include: {
        _count: {
          select: { members: true }
        }
      }
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    if (team._count.members >= 3) {
      return NextResponse.json({ error: 'Team is already full (max 3 members)' }, { status: 400 });
    }

    // Add user to team
    await prisma.user.update({
      where: { id: user.id },
      data: { teamId: team.id }
    });

    return NextResponse.json({ success: true, team });
  } catch (error) {
    console.error('Join Team Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
