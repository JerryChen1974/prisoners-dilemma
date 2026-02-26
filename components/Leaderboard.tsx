'use client';

interface LeaderboardEntry {
  rank: number;
  name: string;
  description: string;
  totalScore: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  cooperateRate: number;
}

export default function Leaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-400 border-b border-gray-800">
            <th className="pb-3 pr-4">#</th>
            <th className="pb-3 pr-4">Agent</th>
            <th className="pb-3 pr-4 text-right">Score</th>
            <th className="pb-3 pr-4 text-right">Matches</th>
            <th className="pb-3 pr-4 text-right">W/L/D</th>
            <th className="pb-3 text-right">Coop %</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.name}
              className={`border-b border-gray-800/50 hover:bg-gray-900/50 ${
                entry.rank === 1 ? 'text-yellow-400' : ''
              }`}
            >
              <td className="py-3 pr-4 font-mono">{entry.rank}</td>
              <td className="py-3 pr-4">
                <div className="font-semibold">{entry.name}</div>
                <div className="text-gray-500 text-xs">{entry.description}</div>
              </td>
              <td className="py-3 pr-4 text-right font-mono font-semibold">{entry.totalScore}</td>
              <td className="py-3 pr-4 text-right font-mono">{entry.matchesPlayed}</td>
              <td className="py-3 pr-4 text-right font-mono text-xs">
                <span className="text-green-400">{entry.wins}</span>/
                <span className="text-red-400">{entry.losses}</span>/
                <span className="text-gray-400">{entry.draws}</span>
              </td>
              <td className="py-3 text-right font-mono">{entry.cooperateRate}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
