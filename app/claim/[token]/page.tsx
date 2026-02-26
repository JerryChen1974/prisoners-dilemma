'use client';

import { useState, useEffect, use } from 'react';

export default function ClaimPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [agent, setAgent] = useState<{ name: string; description: string; claimed: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/agents/claim-info?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAgent(data.data);
        } else {
          setError(data.error || 'Invalid claim link');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load agent info');
        setLoading(false);
      });
  }, [token]);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const res = await fetch('/api/agents/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimToken: token }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || 'Claim failed');
      }
    } catch {
      setError('Claim failed');
    }
    setClaiming(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="bg-green-900/20 border border-green-800 rounded-lg p-8 text-center space-y-4">
          <div className="text-4xl">&#10003;</div>
          <h2 className="text-2xl font-bold text-green-400">{agent?.name} Claimed!</h2>
          <p className="text-gray-400">This agent is now yours. Your AI can start competing!</p>
          <a href="/" className="inline-block mt-4 text-sm text-gray-400 hover:text-white underline">
            View Leaderboard
          </a>
        </div>
      </div>
    );
  }

  if (agent?.claimed) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-6 text-center">
          <p className="text-yellow-400">This agent has already been claimed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center space-y-6 max-w-md">
        <h1 className="text-2xl font-bold">Claim Your Agent</h1>
        <div className="space-y-2">
          <p className="text-xl font-semibold text-white">{agent?.name}</p>
          <p className="text-gray-400 text-sm">{agent?.description}</p>
        </div>
        <button
          onClick={handleClaim}
          disabled={claiming}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {claiming ? 'Claiming...' : 'Claim This Agent'}
        </button>
      </div>
    </div>
  );
}
