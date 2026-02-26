import { connectDB } from '@/lib/db/mongodb';
import Agent from '@/lib/models/Agent';
import Match from '@/lib/models/Match';
import Tournament from '@/lib/models/Tournament';
import FeedItem from '@/lib/models/FeedItem';
import { getEngine, getPayoff, ROUNDS_PER_MATCH, Round, Move } from '@/lib/engine';

async function executeMatch(
  agent1: { id: any; name: string; strategy: string },
  agent2: { id: any; name: string; strategy: string },
  tournamentId: any
) {
  const engine = getEngine();
  const rounds: Round[] = [];
  let agent1Total = 0;
  let agent2Total = 0;

  for (let i = 1; i <= ROUNDS_PER_MATCH; i++) {
    const [move1, move2] = await Promise.all([
      engine.getMove(agent1.strategy, rounds, i, 'agent1'),
      engine.getMove(agent2.strategy, rounds, i, 'agent2'),
    ]);

    const payoff = getPayoff(move1, move2);
    agent1Total += payoff.agent1;
    agent2Total += payoff.agent2;

    rounds.push({
      roundNumber: i,
      agent1Move: move1,
      agent2Move: move2,
      agent1RoundScore: payoff.agent1,
      agent2RoundScore: payoff.agent2,
    });
  }

  const winner = agent1Total > agent2Total
    ? agent1.name
    : agent2Total > agent1Total
    ? agent2.name
    : null;

  const match = await Match.create({
    agent1Id: agent1.id,
    agent2Id: agent2.id,
    agent1Name: agent1.name,
    agent2Name: agent2.name,
    rounds,
    totalRounds: ROUNDS_PER_MATCH,
    agent1Score: agent1Total,
    agent2Score: agent2Total,
    winner,
    status: 'completed',
    tournamentId,
    completedAt: new Date(),
  });

  return match;
}

export async function runTournament() {
  await connectDB();

  const agents = await Agent.find({ strategy: { $ne: '' } });
  if (agents.length < 2) return;

  const tournament = await Tournament.create({
    status: 'in_progress',
    agentIds: agents.map(a => a._id),
  });

  await FeedItem.create({
    type: 'tournament_started',
    content: `Tournament started with ${agents.length} agents!`,
    relatedAgentIds: agents.map(a => a._id),
  });

  const matchIds: any[] = [];
  const agentScores: Record<string, { score: number; matches: number; wins: number; losses: number; draws: number; coops: number; totalMoves: number }> = {};

  for (const agent of agents) {
    agentScores[agent._id.toString()] = { score: 0, matches: 0, wins: 0, losses: 0, draws: 0, coops: 0, totalMoves: 0 };
  }

  // Generate pairings: every agent vs every other (including self-play)
  const pairings: [typeof agents[0], typeof agents[0]][] = [];
  for (let i = 0; i < agents.length; i++) {
    for (let j = i; j < agents.length; j++) {
      pairings.push([agents[i], agents[j]]);
    }
  }

  // Execute all pairings
  for (const [a1, a2] of pairings) {
    const match = await executeMatch(
      { id: a1._id, name: a1.name, strategy: a1.strategy },
      { id: a2._id, name: a2.name, strategy: a2.strategy },
      tournament._id
    );
    matchIds.push(match._id);

    const a1Id = a1._id.toString();
    const a2Id = a2._id.toString();
    agentScores[a1Id].score += match.agent1Score;
    agentScores[a1Id].matches += 1;
    agentScores[a2Id].score += match.agent2Score;
    agentScores[a2Id].matches += 1;

    for (const round of match.rounds) {
      if (round.agent1Move === 'COOPERATE') agentScores[a1Id].coops++;
      if (round.agent2Move === 'COOPERATE') agentScores[a2Id].coops++;
      agentScores[a1Id].totalMoves++;
      agentScores[a2Id].totalMoves++;
    }

    if (match.winner === a1.name) {
      agentScores[a1Id].wins++;
      agentScores[a2Id].losses++;
    } else if (match.winner === a2.name) {
      agentScores[a2Id].wins++;
      agentScores[a1Id].losses++;
    } else {
      agentScores[a1Id].draws++;
      agentScores[a2Id].draws++;
    }
  }

  // Execute RANDOM matches (each agent vs RANDOM)
  for (const agent of agents) {
    const match = await executeMatch(
      { id: agent._id, name: agent.name, strategy: agent.strategy },
      { id: agent._id, name: 'RANDOM', strategy: 'random' },
      tournament._id
    );
    matchIds.push(match._id);

    const aId = agent._id.toString();
    agentScores[aId].score += match.agent1Score;
    agentScores[aId].matches += 1;
    for (const round of match.rounds) {
      if (round.agent1Move === 'COOPERATE') agentScores[aId].coops++;
      agentScores[aId].totalMoves++;
    }
    if (match.winner === agent.name) agentScores[aId].wins++;
    else if (match.winner === 'RANDOM') agentScores[aId].losses++;
    else agentScores[aId].draws++;
  }

  // Update agent stats in DB
  for (const agent of agents) {
    const s = agentScores[agent._id.toString()];
    await Agent.findByIdAndUpdate(agent._id, {
      'stats.totalScore': s.score,
      'stats.matchesPlayed': s.matches,
      'stats.wins': s.wins,
      'stats.losses': s.losses,
      'stats.draws': s.draws,
      'stats.cooperateRate': s.totalMoves > 0 ? Math.round((s.coops / s.totalMoves) * 100) : 0,
    });
  }

  // Finalize tournament
  tournament.matchIds = matchIds;
  tournament.totalMatches = matchIds.length;
  tournament.status = 'completed';
  tournament.completedAt = new Date();
  await tournament.save();

  const sortedAgents = agents
    .map(a => ({ name: a.name, score: agentScores[a._id.toString()].score }))
    .sort((a, b) => b.score - a.score);

  await FeedItem.create({
    type: 'tournament_completed',
    content: `Tournament complete! Winner: ${sortedAgents[0].name} with ${sortedAgents[0].score} points across ${matchIds.length} matches.`,
    relatedAgentIds: agents.map(a => a._id),
  });

  return tournament;
}
