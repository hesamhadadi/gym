import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Gym from '@/models/Gym';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');
    const feature = searchParams.get('feature');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'averageRating';
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { isActive: true };

    if (city) {
      query.$or = [
        { 'location.city.fa': { $regex: city, $options: 'i' } },
        { 'location.city.en': { $regex: city, $options: 'i' } },
      ];
    }

    if (search) {
      query.$or = [
        { 'name.fa': { $regex: search, $options: 'i' } },
        { 'name.en': { $regex: search, $options: 'i' } },
        { 'location.city.fa': { $regex: search, $options: 'i' } },
        { 'location.address.fa': { $regex: search, $options: 'i' } },
      ];
    }

    if (feature) {
      query[`features.${feature}`] = true;
    }

    let sortObj = {};
    if (sort === 'rating') sortObj = { averageRating: -1 };
    else if (sort === 'newest') sortObj = { createdAt: -1 };
    else sortObj = { averageRating: -1 };

    // If coordinates provided, get nearby gyms
    if (lat && lng) {
      const gyms = await Gym.find(query).sort(sortObj).lean();
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);

      const withDistance = gyms.map((gym) => {
        const R = 6371;
        const dLat = ((gym.location.coordinates.lat - userLat) * Math.PI) / 180;
        const dLng = ((gym.location.coordinates.lng - userLng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((userLat * Math.PI) / 180) *
            Math.cos((gym.location.coordinates.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return { ...gym, distance };
      });

      withDistance.sort((a, b) => a.distance - b.distance);
      const paginated = withDistance.slice((page - 1) * limit, page * limit);
      return NextResponse.json({ gyms: paginated, total: withDistance.length });
    }

    const total = await Gym.countDocuments(query);
    const gyms = await Gym.find(query)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ gyms, total });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = session.user as { role: string; id: string };
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();
    const body = await req.json();
    const gym = await Gym.create(body);

    // Link gym to owner
    if (body.ownerId) {
      await User.findByIdAndUpdate(body.ownerId, { gymId: gym._id });
    }

    return NextResponse.json({ gym }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
