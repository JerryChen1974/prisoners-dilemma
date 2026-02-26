import { StrategyEngine, Move, Round } from './types';

type StrategyFunction = (history: Round[], roundNumber: number, role: 'agent1' | 'agent2') => Move;

function getOpponentLastMove(history: Round[], role: 'agent1' | 'agent2'): Move | null {
  if (history.length === 0) return null;
  const lastRound = history[history.length - 1];
  return role === 'agent1' ? lastRound.agent2Move : lastRound.agent1Move;
}

function getMyLastMove(history: Round[], role: 'agent1' | 'agent2'): Move | null {
  if (history.length === 0) return null;
  const lastRound = history[history.length - 1];
  return role === 'agent1' ? lastRound.agent1Move : lastRound.agent2Move;
}

function opponentEverDefected(history: Round[], role: 'agent1' | 'agent2'): boolean {
  return history.some(r => (role === 'agent1' ? r.agent2Move : r.agent1Move) === 'DEFECT');
}

function opponentDefectedLastN(history: Round[], role: 'agent1' | 'agent2', n: number): boolean {
  if (history.length < n) return false;
  const recent = history.slice(-n);
  return recent.every(r => (role === 'agent1' ? r.agent2Move : r.agent1Move) === 'DEFECT');
}

const STRATEGIES: Record<string, StrategyFunction> = {
  'always_cooperate': () => 'COOPERATE',
  'always_defect': () => 'DEFECT',
  'random': () => Math.random() < 0.5 ? 'COOPERATE' : 'DEFECT',

  'tit_for_tat': (history, _round, role) => {
    const lastMove = getOpponentLastMove(history, role);
    return lastMove ?? 'COOPERATE';
  },

  'grudger': (history, _round, role) => {
    return opponentEverDefected(history, role) ? 'DEFECT' : 'COOPERATE';
  },

  'pavlov': (history, _round, role) => {
    if (history.length === 0) return 'COOPERATE';
    const myLast = getMyLastMove(history, role);
    const oppLast = getOpponentLastMove(history, role);
    return myLast === oppLast ? 'COOPERATE' : 'DEFECT';
  },

  'tit_for_two_tats': (history, _round, role) => {
    return opponentDefectedLastN(history, role, 2) ? 'DEFECT' : 'COOPERATE';
  },
};

function identifyStrategy(text: string): string {
  const lower = text.toLowerCase();

  if (/always\s+(cooperate|coop)/i.test(lower)) return 'always_cooperate';
  if (/always\s+defect/i.test(lower)) return 'always_defect';
  if (/\brandom\b/i.test(lower)) return 'random';
  if (/\bgrudg(er|e)\b/i.test(lower) || /grim\s*trigger/i.test(lower)) return 'grudger';
  if (/\bpavlov\b/i.test(lower) || /win.?stay.*lose.?shift/i.test(lower)) return 'pavlov';
  if (/tit\s*for\s*two\s*tats/i.test(lower)) return 'tit_for_two_tats';
  if (/tit\s*for\s*tat/i.test(lower) || /mirror/i.test(lower) || /copy/i.test(lower)) return 'tit_for_tat';

  return 'tit_for_tat';
}

export class RuleBasedEngine implements StrategyEngine {
  async getMove(
    strategy: string,
    history: Round[],
    roundNumber: number,
    agentRole: 'agent1' | 'agent2'
  ): Promise<Move> {
    const strategyKey = identifyStrategy(strategy);
    const fn = STRATEGIES[strategyKey];
    return fn(history, roundNumber, agentRole);
  }
}
