import { StrategyEngine } from './types';
import { RuleBasedEngine } from './rule-based';

export function getEngine(): StrategyEngine {
  return new RuleBasedEngine();
}

export * from './types';
