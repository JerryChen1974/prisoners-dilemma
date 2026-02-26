import mongoose, { Schema, Document } from 'mongoose';

export interface ITournament extends Document {
  status: 'pending' | 'in_progress' | 'completed';
  agentIds: mongoose.Types.ObjectId[];
  matchIds: mongoose.Types.ObjectId[];
  totalMatches: number;
  createdAt: Date;
  completedAt: Date | null;
}

const TournamentSchema = new Schema<ITournament>({
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  agentIds: [{ type: Schema.Types.ObjectId, ref: 'Agent' }],
  matchIds: [{ type: Schema.Types.ObjectId, ref: 'Match' }],
  totalMatches: { type: Number, default: 0 },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.models.Tournament || mongoose.model<ITournament>('Tournament', TournamentSchema);
