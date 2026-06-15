import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

function generateTeamId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('session_userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { name } = data;

    if (!name) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.teamId) {
      return NextResponse.json({ error: 'You are already in a team' }, { status: 400 });
    }

    let teamId = generateTeamId();
    let isUnique = false;
    
    // Ensure uniqueness
    while (!isUnique) {
      const existingTeam = await prisma.team.findUnique({ where: { id: teamId } });
      if (!existingTeam) {
        isUnique = true;
      } else {
        teamId = generateTeamId();
      }
    }

    const newTeam = await prisma.team.create({
      data: {
        id: teamId,
        name: name,
        leaderId: user.id,
        members: {
          connect: { id: user.id }
        }
      },
    });

    return NextResponse.json({ success: true, team: newTeam });
  } catch (error) {
    console.error('Create Team Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
