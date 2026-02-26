import mongoose, { Schema, Document } from 'mongoose';

export interface IAgent extends Document {
  name: string;
  description: string;
  apiKey: string;
  claimToken: string;
  claimed: boolean;
  strategy: string;
  createdAt: Date;
  updatedAt: Date;
  lastActive: Date;
  stats: {
    totalScore: number;
    matchesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
    cooperateRate: number;
  };
}

const AgentSchema = new Schema<IAgent>({
  name: { type: String, required: true, unique: true, minlength: 2, maxlength: 50 },
  description: { type: String, required: true, maxlength: 500 },
  apiKey: { type: String, required: true, unique: true, index: true },
  claimToken: { type: String, required: true, unique: true },
  claimed: { type: Boolean, default: false },
  strategy: { type: String, default: '' },
  lastActive: { type: Date, default: Date.now },
  stats: {
    totalScore: { type: Number, default: 0 },
    matchesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    cooperateRate: { type: Number, default: 0 },
  },
}, { timestamps: true });

AgentSchema.set('toJSON', {
  transform: (_doc: any, ret: any) => {
    delete ret.apiKey;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.models.Agent || mongoose.model<IAgent>('Agent', AgentSchema);
