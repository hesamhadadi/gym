import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Gym from '@/models/Gym';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { handleApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });

    await dbConnect();
    const { rating, comment } = await req.json();
    const user = session.user as { id: string; name: string };

    const gym = await Gym.findById(params.id);
    if (!gym) return NextResponse.json({ error: 'Gym not found' }, { status: 404 });

    // Check if already reviewed
    const existingReview = gym.reviews.find((r) => r.userId.toString() === user.id);
    if (existingReview) {
      return NextResponse.json({ error: 'Already reviewed' }, { status: 400 });
    }

    gym.reviews.push({
      userId: user.id as unknown as import('mongoose').Types.ObjectId,
      userName: user.name || 'Anonymous',
      rating,
      comment,
      createdAt: new Date(),
    });

    // Recalculate average
    const total = gym.reviews.reduce((sum, r) => sum + r.rating, 0);
    gym.averageRating = Math.round((total / gym.reviews.length) * 10) / 10;
    gym.totalReviews = gym.reviews.length;

    await gym.save();
    return NextResponse.json({ message: 'Review added' });
  } catch (error) {
    return handleApiError(error);
  }
}
