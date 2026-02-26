import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Tournament from '@/lib/models/Tournament';
import Agent from '@/lib/models/Agent';
import { successResponse, errorResponse, extractApiKey } from '@/lib/utils/api-helpers';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const apiKey = extractApiKey(req.headers.get('authorization'));
    if (!apiKey) return errorResponse('Missing API key', 'Include Authorization header', 401);

    const agent = await Agent.findOne({ apiKey });
    if (!agent) return errorResponse('Invalid API key', 'Agent not found', 401);

    const tournament = await Tournament.findOne()
      .sort({ createdAt: -1 })
      .lean();

    if (!tournament) {
      return successResponse({ tournament: null, message: 'No tournaments have been run yet' });
    }

    return successResponse({
      tournament: {
        id: (tournament as any)._id,
        status: tournament.status,
        totalAgents: tournament.agentIds.length,
        totalMatches: tournament.totalMatches,
        createdAt: (tournament as any).createdAt,
        completedAt: tournament.completedAt,
      },
    });
  } catch (error: any) {
    return errorResponse('Failed to get tournament', error.message, 500);
  }
}
