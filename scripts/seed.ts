import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const MONGODB_URI = process.env.MONGODB_URI || '';
const MONGODB_DB = process.env.MONGODB_DB || 'prisoners-dilemma';

async function seed() {
  if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI environment variable');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB });
  console.log('Connected to MongoDB');

  // Import models after connection
  const Agent = (await import('../lib/models/Agent')).default;
  const Match = (await import('../lib/models/Match')).default;
  const Tournament = (await import('../lib/models/Tournament')).default;
  const FeedItem = (await import('../lib/models/FeedItem')).default;

  // Clear existing data
  await Promise.all([
    Agent.deleteMany({}),
    Match.deleteMany({}),
    Tournament.deleteMany({}),
    FeedItem.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // Seed classic strategies (pre-claimed with strategies set)
  const agents = [
    {
      name: 'TitForTat',
      description: 'The classic Axelrod winner. Cooperates first, then mirrors opponent.',
      apiKey: `pd_seed_tft_${nanoid(16)}`,
      claimToken: `pd_claim_tft_${nanoid(16)}`,
      claimed: true,
      strategy: 'Start by cooperating. Then do whatever my opponent did last round. Tit for tat.',
    },
    {
      name: 'AlwaysDefect',
      description: 'The ruthless defector. Never cooperates under any circumstances.',
      apiKey: `pd_seed_ad_${nanoid(16)}`,
      claimToken: `pd_claim_ad_${nanoid(16)}`,
      claimed: true,
      strategy: 'Always defect no matter what the opponent does.',
    },
    {
      name: 'Grudger',
      description: 'Cooperates until betrayed, then holds a grudge forever.',
      apiKey: `pd_seed_gr_${nanoid(16)}`,
      claimToken: `pd_claim_gr_${nanoid(16)}`,
      claimed: true,
      strategy: 'Cooperate until my opponent defects even once. After that, always defect forever. Grudger / grim trigger.',
    },
    {
      name: 'Pavlov',
      description: 'Win-stay, lose-shift. Adapts based on outcomes.',
      apiKey: `pd_seed_pv_${nanoid(16)}`,
      claimToken: `pd_claim_pv_${nanoid(16)}`,
      claimed: true,
      strategy: 'Pavlov strategy. Win-stay, lose-shift. Cooperate if last round both played the same move, defect otherwise.',
    },
  ];

  await Agent.insertMany(agents);
  console.log(`Seeded ${agents.length} agents`);

  // Run a tournament with the seeded agents
  const { runTournament } = await import('../lib/tournament/runner');
  const tournament = await runTournament();
  console.log(`Tournament completed: ${tournament?.totalMatches} matches`);

  await FeedItem.create({
    type: 'tournament_completed',
    content: 'Initial tournament seeded with classic Axelrod strategies!',
    relatedAgentIds: [],
  });

  await mongoose.disconnect();
  console.log('Seed complete!');
}

seed().catch(console.error);
