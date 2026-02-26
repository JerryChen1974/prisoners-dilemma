import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import FeedItem from '@/lib/models/FeedItem';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '20'), 50);
    const items = await FeedItem.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return successResponse({ feed: items });
  } catch (error: any) {
    return errorResponse('Failed to get feed', error.message, 500);
  }
}
