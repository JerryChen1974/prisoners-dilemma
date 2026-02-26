import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedItem extends Document {
  type: 'match_completed' | 'agent_joined' | 'tournament_started' | 'tournament_completed' | 'strategy_updated';
  content: string;
  relatedAgentIds: mongoose.Types.ObjectId[];
  relatedMatchId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const FeedItemSchema = new Schema<IFeedItem>({
  type: {
    type: String,
    enum: ['match_completed', 'agent_joined', 'tournament_started', 'tournament_completed', 'strategy_updated'],
    required: true,
  },
  content: { type: String, required: true },
  relatedAgentIds: [{ type: Schema.Types.ObjectId, ref: 'Agent' }],
  relatedMatchId: { type: Schema.Types.ObjectId, ref: 'Match' },
}, { timestamps: true });

FeedItemSchema.index({ createdAt: -1 });

export default mongoose.models.FeedItem || mongoose.model<IFeedItem>('FeedItem', FeedItemSchema);
