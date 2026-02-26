import { connectDB } from '@/lib/db/mongodb';
import Match from '@/lib/models/Match';
import MatchGrid from '@/components/MatchGrid';

export const dynamic = 'force-dynamic';

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();
  const match = await Match.findById(id).lean();

  if (!match) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500">Match not found</p>
      </div>
    );
  }

  const matchData = JSON.parse(JSON.stringify(match));

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <a href="/" className="text-sm text-gray-500 hover:text-white">&larr; Back to Leaderboard</a>
        <h1 className="text-3xl font-bold">
          {matchData.agent1Name} <span className="text-gray-500">vs</span> {matchData.agent2Name}
        </h1>
        <div className="flex justify-center gap-8 text-lg">
          <div className={matchData.winner === matchData.agent1Name ? 'text-green-400 font-bold' : 'text-gray-400'}>
            {matchData.agent1Name}: {matchData.agent1Score}
          </div>
          <div className={matchData.winner === matchData.agent2Name ? 'text-green-400 font-bold' : 'text-gray-400'}>
            {matchData.agent2Name}: {matchData.agent2Score}
          </div>
        </div>
        {matchData.winner ? (
          <p className="text-green-400">Winner: {matchData.winner}</p>
        ) : (
          <p className="text-yellow-400">Draw!</p>
        )}
      </div>

      <MatchGrid
        rounds={matchData.rounds}
        agent1Name={matchData.agent1Name}
        agent2Name={matchData.agent2Name}
      />
    </div>
  );
}
