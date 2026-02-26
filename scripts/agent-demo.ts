#!/usr/bin/env npx tsx
/**
 * Autonomous Agent Demo for Prisoner's Dilemma Tournament
 *
 * Usage:
 *   npx tsx scripts/agent-demo.ts --name "AlphaAgent" --strategy "tit_for_tat"
 *   npx tsx scripts/agent-demo.ts --name "BetaAgent" --strategy "pavlov"
 *
 * Run two instances in parallel for the demo recording.
 * Zero external dependencies — uses built-in fetch() only.
 */

const BASE_URL = process.env.APP_URL || 'https://prisoners-dilemma-mocha.vercel.app';
const MAX_REFINEMENTS = 3;

// Strategy library: shorthand → natural language that matches identifyStrategy() regex
const STRATEGY_TEXT: Record<string, string> = {
  tit_for_tat: 'I use tit for tat: cooperate on the first round, then copy whatever my opponent did last round.',
  grudger: 'I am a grudger: cooperate until my opponent defects, then always defect forever.',
  pavlov: 'I use pavlov (win-stay lose-shift): cooperate if we both made the same move last round, defect otherwise.',
  tit_for_two_tats: 'I play tit for two tats: only defect if my opponent defected two rounds in a row.',
  always_cooperate: 'I always cooperate no matter what.',
  always_defect: 'I always defect no matter what.',
  random: 'I play randomly, cooperating or defecting with equal probability.',
};

// Refinement chain: if current strategy isn't #1, try the next one
const REFINEMENT_CHAIN = ['tit_for_tat', 'grudger', 'pavlov', 'tit_for_two_tats'];

// ─── Logging ──────────────────────────────────────────────

function timestamp(): string {
  return new Date().toLocaleTimeString('en-US', { hour12: false });
}

function log(agentName: string, phase: string, message: string) {
  console.log(`[${timestamp()}] [${agentName}] [${phase}] ${message}`);
}

// ─── CLI Args ─────────────────────────────────────────────

function parseArgs(): { name: string; strategy: string } {
  const args = process.argv.slice(2);
  let name = '';
  let strategy = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--name' && args[i + 1]) name = args[++i];
    if (args[i] === '--strategy' && args[i + 1]) strategy = args[++i];
  }

  if (!name || !strategy) {
    console.error('Usage: npx tsx scripts/agent-demo.ts --name "AgentName" --strategy "tit_for_tat"');
    console.error(`Available strategies: ${Object.keys(STRATEGY_TEXT).join(', ')}`);
    process.exit(1);
  }

  if (!STRATEGY_TEXT[strategy]) {
    console.error(`Unknown strategy "${strategy}". Available: ${Object.keys(STRATEGY_TEXT).join(', ')}`);
    process.exit(1);
  }

  return { name, strategy };
}

// ─── API Helpers ──────────────────────────────────────────

async function apiCall(method: string, path: string, body?: object, apiKey?: string): Promise<any> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const json = await res.json();
  if (!json.success) {
    throw new Error(`API error on ${method} ${path}: ${json.error} — ${json.hint || ''}`);
  }
  return json.data;
}

// ─── Phase 1: Discovery ──────────────────────────────────

async function discover(agentName: string): Promise<void> {
  log(agentName, 'DISCOVER', `Fetching skill.md from ${BASE_URL}/skill.md`);

  const res = await fetch(`${BASE_URL}/skill.md`);
  const text = await res.text();

  // Extract key info from skill.md
  const hasRegister = text.includes('/api/agents/register');
  const hasStrategy = text.includes('/api/agents/me/strategy');
  const hasLeaderboard = text.includes('/api/leaderboard');

  log(agentName, 'DISCOVER', `Parsed skill.md — register: ${hasRegister}, strategy: ${hasStrategy}, leaderboard: ${hasLeaderboard}`);

  if (!hasRegister || !hasStrategy || !hasLeaderboard) {
    throw new Error('skill.md missing expected API endpoints');
  }

  log(agentName, 'DISCOVER', 'API protocol understood. Proceeding to registration.');
}

// ─── Phase 2: Register ──────────────────────────────────

async function register(agentName: string): Promise<{ apiKey: string; claimToken: string }> {
  log(agentName, 'REGISTER', `Registering as "${agentName}"...`);

  const data = await apiCall('POST', '/api/agents/register', {
    name: agentName,
    description: `Autonomous demo agent competing in the Prisoner's Dilemma tournament.`,
  });

  const apiKey = data.agent.api_key;
  // Extract claim token from claim_url
  const claimToken = data.agent.claim_url.split('/claim/')[1];

  log(agentName, 'REGISTER', `Registered! API key: ${apiKey.substring(0, 10)}...`);
  return { apiKey, claimToken };
}

// ─── Phase 3: Claim ──────────────────────────────────────

async function claim(agentName: string, claimToken: string): Promise<void> {
  log(agentName, 'CLAIM', 'Self-claiming agent...');

  const data = await apiCall('POST', '/api/agents/claim', { claimToken });
  log(agentName, 'CLAIM', `Claimed: ${data.message}`);
}

// ─── Phase 4: Set Strategy ──────────────────────────────

async function setStrategy(agentName: string, apiKey: string, strategyKey: string): Promise<void> {
  const strategyText = STRATEGY_TEXT[strategyKey];
  log(agentName, 'STRATEGY', `Setting strategy: "${strategyKey}"`);
  log(agentName, 'STRATEGY', `Description: "${strategyText}"`);

  const data = await apiCall('PUT', '/api/agents/me/strategy', { strategy: strategyText }, apiKey);
  log(agentName, 'STRATEGY', `${data.message}. ${data.tournament}`);
}

// ─── Phase 5: Check Results ─────────────────────────────

interface Results {
  rank: number;
  totalAgents: number;
  totalScore: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
}

async function checkResults(agentName: string, apiKey: string): Promise<Results> {
  log(agentName, 'RESULTS', 'Checking leaderboard...');

  const leaderboardData = await apiCall('GET', '/api/leaderboard');
  const leaderboard = leaderboardData.leaderboard;
  const me = leaderboard.find((e: any) => e.name === agentName);

  if (!me) {
    log(agentName, 'RESULTS', 'Not on leaderboard yet (no matches played)');
    return { rank: leaderboard.length + 1, totalAgents: leaderboard.length, totalScore: 0, matchesPlayed: 0, wins: 0, losses: 0 };
  }

  log(agentName, 'RESULTS', `Rank: #${me.rank}/${leaderboard.length} | Score: ${me.totalScore} | W/L: ${me.wins}/${me.losses} | Co-op rate: ${(me.cooperateRate * 100).toFixed(0)}%`);

  // Show top 3
  log(agentName, 'RESULTS', `--- Leaderboard Top 3 ---`);
  leaderboard.slice(0, 3).forEach((entry: any) => {
    const marker = entry.name === agentName ? ' <-- YOU' : '';
    log(agentName, 'RESULTS', `  #${entry.rank} ${entry.name}: ${entry.totalScore} pts${marker}`);
  });

  // Check recent matches
  log(agentName, 'RESULTS', 'Checking recent matches...');
  const matchData = await apiCall('GET', '/api/matches?limit=5', undefined, apiKey);
  matchData.matches.forEach((m: any) => {
    const opponent = m.agent1Name === agentName ? m.agent2Name : m.agent1Name;
    const myScore = m.agent1Name === agentName ? m.agent1Score : m.agent2Score;
    const theirScore = m.agent1Name === agentName ? m.agent2Score : m.agent1Score;
    const result = m.winner === agentName ? 'WON' : m.winner === 'draw' ? 'DRAW' : 'LOST';
    log(agentName, 'RESULTS', `  vs ${opponent}: ${myScore}-${theirScore} (${result})`);
  });

  return {
    rank: me.rank,
    totalAgents: leaderboard.length,
    totalScore: me.totalScore,
    matchesPlayed: me.matchesPlayed,
    wins: me.wins,
    losses: me.losses,
  };
}

// ─── Phase 6: Analyze & Refine ──────────────────────────

function getNextStrategy(currentKey: string): string | null {
  const idx = REFINEMENT_CHAIN.indexOf(currentKey);
  if (idx === -1 || idx >= REFINEMENT_CHAIN.length - 1) return null;
  return REFINEMENT_CHAIN[idx + 1];
}

// ─── Main Loop ──────────────────────────────────────────

async function main() {
  const { name, strategy } = parseArgs();

  console.log('');
  console.log('='.repeat(60));
  log(name, 'START', `Autonomous Prisoner's Dilemma Agent`);
  log(name, 'START', `Target: ${BASE_URL}`);
  log(name, 'START', `Initial strategy: ${strategy}`);
  console.log('='.repeat(60));
  console.log('');

  // Phase 1: Discovery
  await discover(name);

  // Phase 2: Register
  const { apiKey, claimToken } = await register(name);

  // Phase 3: Claim
  await claim(name, claimToken);

  // Phase 4: Set initial strategy (triggers tournament)
  let currentStrategy = strategy;
  await setStrategy(name, apiKey, currentStrategy);

  // Wait a moment for tournament to fully complete
  log(name, 'WAIT', 'Waiting for tournament results to propagate...');
  await new Promise(r => setTimeout(r, 2000));

  // Phase 5: Check results
  let results = await checkResults(name, apiKey);

  // Phase 6: Refinement loop
  let refinements = 0;
  while (results.rank > 1 && refinements < MAX_REFINEMENTS) {
    refinements++;
    const nextStrategy = getNextStrategy(currentStrategy);

    if (!nextStrategy) {
      log(name, 'REFINE', `No more strategies to try. Staying with "${currentStrategy}".`);
      break;
    }

    console.log('');
    log(name, 'REFINE', `--- Refinement ${refinements}/${MAX_REFINEMENTS} ---`);
    log(name, 'REFINE', `Currently rank #${results.rank}. Switching from "${currentStrategy}" to "${nextStrategy}"...`);

    currentStrategy = nextStrategy;
    await setStrategy(name, apiKey, currentStrategy);

    log(name, 'WAIT', 'Waiting for tournament results...');
    await new Promise(r => setTimeout(r, 2000));

    results = await checkResults(name, apiKey);
  }

  // Final summary
  console.log('');
  console.log('='.repeat(60));
  log(name, 'DONE', `Final rank: #${results.rank}/${results.totalAgents}`);
  log(name, 'DONE', `Final strategy: ${currentStrategy}`);
  log(name, 'DONE', `Total score: ${results.totalScore} | Matches: ${results.matchesPlayed} | W/L: ${results.wins}/${results.losses}`);
  console.log('='.repeat(60));
  console.log('');
}

main().catch((err) => {
  console.error(`\n[FATAL] ${err.message}\n`);
  process.exit(1);
});
