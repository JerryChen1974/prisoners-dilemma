import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Agent from '@/lib/models/Agent';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return errorResponse('Missing token', 'Provide token parameter', 400);

  await connectDB();
  const agent = await Agent.findOne({ claimToken: token }).select('name description claimed');
  if (!agent) return errorResponse('Invalid claim link', 'Agent not found', 404);

  return successResponse({ name: agent.name, description: agent.description, claimed: agent.claimed });
}
