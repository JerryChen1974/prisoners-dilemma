export type Move = 'COOPERATE' | 'DEFECT';

export interface Round {
  roundNumber: number;
  agent1Move: Move;
  agent2Move: Move;
  agent1RoundScore: number;
  agent2RoundScore: number;
}

export interface StrategyEngine {
  getMove(
    strategy: string,
    history: Round[],
    roundNumber: number,
    agentRole: 'agent1' | 'agent2'
  ): Promise<Move>;
}

export const PAYOFF_MATRIX = {
  COOPERATE_COOPERATE: { agent1: 3, agent2: 3 },
  COOPERATE_DEFECT:    { agent1: 0, agent2: 5 },
  DEFECT_COOPERATE:    { agent1: 5, agent2: 0 },
  DEFECT_DEFECT:       { agent1: 1, agent2: 1 },
} as const;

export function getPayoff(agent1Move: Move, agent2Move: Move) {
  const key = `${agent1Move}_${agent2Move}` as keyof typeof PAYOFF_MATRIX;
  return PAYOFF_MATRIX[key];
}

export const ROUNDS_PER_MATCH = 50;
