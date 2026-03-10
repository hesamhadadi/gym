import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Gym from '@/models/Gym';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { handleApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const gym = await Gym.findById(params.id).lean();
    if (!gym) return NextResponse.json({ error: 'Gym not found' }, { status: 404 });
    return NextResponse.json({ gym });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await req.json();
    const user = session.user as { role: string; id: string; gymId?: string };

    const gym = await Gym.findById(params.id);
    if (!gym) return NextResponse.json({ error: 'Gym not found' }, { status: 404 });

    // Only admin or gym owner can update
    if (user.role !== 'admin' && gym.ownerId.toString() !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await Gym.findByIdAndUpdate(params.id, body, { new: true });
    return NextResponse.json({ gym: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as { role: string };
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();
    await Gym.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return handleApiError(error);
  }
}
