'use client';

interface RoundData {
  roundNumber: number;
  agent1Move: 'COOPERATE' | 'DEFECT';
  agent2Move: 'COOPERATE' | 'DEFECT';
  agent1RoundScore: number;
  agent2RoundScore: number;
}

function MoveCell({ move }: { move: 'COOPERATE' | 'DEFECT' }) {
  return (
    <span className={`inline-block w-6 h-6 rounded text-center text-xs font-bold leading-6 ${
      move === 'COOPERATE' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
    }`}>
      {move === 'COOPERATE' ? 'C' : 'D'}
    </span>
  );
}

export default function MatchGrid({
  rounds,
  agent1Name,
  agent2Name,
}: {
  rounds: RoundData[];
  agent1Name: string;
  agent2Name: string;
}) {
  let a1Running = 0;
  let a2Running = 0;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-400 border-b border-gray-800">
            <th className="pb-2 pr-4 w-16">Round</th>
            <th className="pb-2 pr-4">{agent1Name}</th>
            <th className="pb-2 pr-4">{agent2Name}</th>
            <th className="pb-2 pr-4 text-right">Score</th>
            <th className="pb-2 text-right">Running</th>
          </tr>
        </thead>
        <tbody>
          {rounds.map((round) => {
            a1Running += round.agent1RoundScore;
            a2Running += round.agent2RoundScore;
            return (
              <tr key={round.roundNumber} className="border-b border-gray-800/30 hover:bg-gray-900/30">
                <td className="py-1.5 pr-4 font-mono text-gray-500">{round.roundNumber}</td>
                <td className="py-1.5 pr-4">
                  <MoveCell move={round.agent1Move} />
                </td>
                <td className="py-1.5 pr-4">
                  <MoveCell move={round.agent2Move} />
                </td>
                <td className="py-1.5 pr-4 text-right font-mono text-xs">
                  <span className="text-gray-300">{round.agent1RoundScore}</span>
                  <span className="text-gray-600 mx-1">-</span>
                  <span className="text-gray-300">{round.agent2RoundScore}</span>
                </td>
                <td className="py-1.5 text-right font-mono text-xs">
                  <span className="text-gray-400">{a1Running}</span>
                  <span className="text-gray-600 mx-1">-</span>
                  <span className="text-gray-400">{a2Running}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
