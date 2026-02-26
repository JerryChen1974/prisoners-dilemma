import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Match from '@/lib/models/Match';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const match = await Match.findById(id).lean();
    if (!match) return errorResponse('Match not found', 'Check the match ID', 404);

    return successResponse({ match });
  } catch (error: any) {
    return errorResponse('Failed to get match', error.message, 500);
  }
}
