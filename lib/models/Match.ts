import mongoose, { Schema, Document } from 'mongoose';

export interface IRound {
  roundNumber: number;
  agent1Move: 'COOPERATE' | 'DEFECT';
  agent2Move: 'COOPERATE' | 'DEFECT';
  agent1RoundScore: number;
  agent2RoundScore: number;
}

export interface IMatch extends Document {
  agent1Id: mongoose.Types.ObjectId;
  agent2Id: mongoose.Types.ObjectId;
  agent1Name: string;
  agent2Name: string;
  rounds: IRound[];
  totalRounds: number;
  agent1Score: number;
  agent2Score: number;
  winner: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  tournamentId: mongoose.Types.ObjectId;
  createdAt: Date;
  completedAt: Date | null;
}

const RoundSchema = new Schema<IRound>({
  roundNumber: Number,
  agent1Move: { type: String, enum: ['COOPERATE', 'DEFECT'] },
  agent2Move: { type: String, enum: ['COOPERATE', 'DEFECT'] },
  agent1RoundScore: Number,
  agent2RoundScore: Number,
}, { _id: false });

const MatchSchema = new Schema<IMatch>({
  agent1Id: { type: Schema.Types.ObjectId, ref: 'Agent', required: true },
  agent2Id: { type: Schema.Types.ObjectId, ref: 'Agent', required: true },
  agent1Name: { type: String, required: true },
  agent2Name: { type: String, required: true },
  rounds: [RoundSchema],
  totalRounds: { type: Number, default: 50 },
  agent1Score: { type: Number, default: 0 },
  agent2Score: { type: Number, default: 0 },
  winner: { type: String, default: null },
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  tournamentId: { type: Schema.Types.ObjectId, ref: 'Tournament', required: true },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.models.Match || mongoose.model<IMatch>('Match', MatchSchema);
