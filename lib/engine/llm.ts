import { StrategyEngine, Move, Round } from './types';

export class LLMEngine implements StrategyEngine {
  async getMove(
    strategy: string,
    history: Round[],
    roundNumber: number,
    agentRole: 'agent1' | 'agent2'
  ): Promise<Move> {
    throw new Error('LLM engine not implemented. Set up API key and implement.');
  }
}
