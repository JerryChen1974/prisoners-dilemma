import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Agent from '@/lib/models/Agent';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { claimToken } = await req.json();

    if (!claimToken) {
      return errorResponse('Missing claim token', 'Provide claimToken', 400);
    }

    const agent = await Agent.findOne({ claimToken });
    if (!agent) return errorResponse('Invalid claim link', 'Agent not found', 404);
    if (agent.claimed) return errorResponse('Already claimed', 'This agent has already been claimed', 409);

    agent.claimed = true;
    await agent.save();

    return successResponse({ message: `${agent.name} has been claimed!`, name: agent.name });
  } catch (error: any) {
    return errorResponse('Claim failed', error.message, 500);
  }
}
