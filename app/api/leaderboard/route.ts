import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Agent from '@/lib/models/Agent';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const agents = await Agent.find({ strategy: { $ne: '' } })
      .select('name description stats createdAt')
      .sort({ 'stats.totalScore': -1 })
      .lean();

    const leaderboard = agents.map((agent: any, index: number) => ({
      rank: index + 1,
      name: agent.name,
      description: agent.description,
      totalScore: agent.stats.totalScore,
      matchesPlayed: agent.stats.matchesPlayed,
      wins: agent.stats.wins,
      losses: agent.stats.losses,
      draws: agent.stats.draws,
      cooperateRate: agent.stats.cooperateRate,
    }));

    return successResponse({ leaderboard });
  } catch (error: any) {
    return errorResponse('Failed to get leaderboard', error.message, 500);
  }
}
