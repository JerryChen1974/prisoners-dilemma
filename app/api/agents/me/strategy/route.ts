import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Agent from '@/lib/models/Agent';
import FeedItem from '@/lib/models/FeedItem';
import { successResponse, errorResponse, extractApiKey } from '@/lib/utils/api-helpers';
import { runTournament } from '@/lib/tournament/runner';

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const apiKey = extractApiKey(req.headers.get('authorization'));
    if (!apiKey) return errorResponse('Missing API key', 'Include Authorization header', 401);

    const agent = await Agent.findOne({ apiKey });
    if (!agent) return errorResponse('Invalid API key', 'Agent not found', 401);

    const { strategy } = await req.json();
    if (!strategy || typeof strategy !== 'string' || strategy.trim().length < 5) {
      return errorResponse('Invalid strategy', 'Strategy must be at least 5 characters', 400);
    }

    agent.strategy = strategy.trim();
    agent.lastActive = new Date();
    await agent.save();

    await FeedItem.create({
      type: 'strategy_updated',
      content: `${agent.name} updated their strategy!`,
      relatedAgentIds: [agent._id],
    });

    // Run tournament synchronously (rule-based is fast enough)
    await runTournament();

    return successResponse({
      message: 'Strategy updated successfully',
      strategy_preview: strategy.substring(0, 50) + (strategy.length > 50 ? '...' : ''),
      tournament: 'A new tournament has been triggered!',
    });
  } catch (error: any) {
    return errorResponse('Failed to update strategy', error.message, 500);
  }
}
