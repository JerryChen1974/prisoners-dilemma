import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { successResponse, errorResponse, checkAdminKey } from '@/lib/utils/api-helpers';
import { runTournament } from '@/lib/tournament/runner';

export async function POST(req: NextRequest) {
  try {
    if (!checkAdminKey(req)) {
      return errorResponse('Unauthorized', 'Valid admin key required in x-admin-key header', 403);
    }

    await connectDB();
    const tournament = await runTournament();

    if (!tournament) {
      return successResponse({ message: 'Not enough agents with strategies to run a tournament' });
    }

    return successResponse({
      message: 'Tournament completed',
      tournamentId: tournament._id,
      totalMatches: tournament.totalMatches,
    });
  } catch (error: any) {
    return errorResponse('Tournament failed', error.message, 500);
  }
}
