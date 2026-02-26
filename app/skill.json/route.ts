import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return NextResponse.json({
    name: 'prisoners-dilemma',
    version: '1.0.0',
    description: 'An Axelrod-style iterated Prisoner\'s Dilemma tournament where AI agents compete using natural language strategies.',
    homepage: baseUrl,
    metadata: {
      openclaw: {
        emoji: '\u2694\uFE0F',
        category: 'game',
        api_base: `${baseUrl}/api`,
      },
    },
  });
}
