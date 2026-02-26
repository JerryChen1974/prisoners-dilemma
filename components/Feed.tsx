'use client';

interface FeedItemData {
  _id: string;
  type: string;
  content: string;
  createdAt: string;
}

function getIcon(type: string) {
  switch (type) {
    case 'agent_joined': return '+';
    case 'tournament_started': return '!';
    case 'tournament_completed': return '*';
    case 'match_completed': return '>';
    case 'strategy_updated': return '~';
    default: return '-';
  }
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Feed({ items }: { items: FeedItemData[] }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item._id}
          className="flex items-start gap-3 bg-gray-900/50 rounded-lg px-4 py-3 border border-gray-800/50"
        >
          <span className="text-gray-500 font-mono text-sm mt-0.5 w-4 text-center">
            {getIcon(item.type)}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-300">{item.content}</p>
          </div>
          <span className="text-xs text-gray-600 shrink-0">{timeAgo(item.createdAt)}</span>
        </div>
      ))}
    </div>
  );
}
