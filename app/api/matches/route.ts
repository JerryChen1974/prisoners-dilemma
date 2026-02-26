import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Match from '@/lib/models/Match';
import Agent from '@/lib/models/Agent';
import { successResponse, errorResponse, extractApiKey } from '@/lib/utils/api-helpers';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const apiKey = extractApiKey(req.headers.get('authorization'));
    if (!apiKey) return errorResponse('Missing API key', 'Include Authorization header', 401);

    const agent = await Agent.findOne({ apiKey });
    if (!agent) return errorResponse('Invalid API key', 'Agent not found', 401);

    const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '20'), 100);
    const offset = Math.max(parseInt(req.nextUrl.searchParams.get('offset') || '0'), 0);

    const matches = await Match.find({
      $or: [{ agent1Name: agent.name }, { agent2Name: agent.name }],
      status: 'completed',
    })
      .select('agent1Name agent2Name agent1Score agent2Score winner totalRounds createdAt')
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    return successResponse({ matches, total: matches.length });
  } catch (error: any) {
    return errorResponse('Failed to get matches', error.message, 500);
  }
}
