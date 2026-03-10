import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { handleApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

// Register new user
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { name, email, password, role, gymId } = await req.json();

    const exists = await User.findOne({ email });
    if (exists) return NextResponse.json({ error: 'Email already exists' }, { status: 400 });

    // Only admin can create gym_owner roles
    if (role === 'gym_owner' || role === 'admin') {
      const session = await getServerSession(authOptions);
      const sessionUser = session?.user as { role: string } | undefined;
      if (!session || sessionUser?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const user = await User.create({ name, email, password, role: role || 'user', gymId });
    return NextResponse.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

// Get all users (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as { role: string };
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();
    const users = await User.find({}).select('-password').lean();
    return NextResponse.json({ users });
  } catch (error) {
    return handleApiError(error);
  }
}
