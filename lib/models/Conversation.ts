import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
    participants: mongoose.Types.ObjectId[];
    participantNames: string[];
    status: 'active' | 'completed';
    messageCount: number;
    lastActivity: Date;
}

const ConversationSchema = new Schema<IConversation>({
    participants: [{ type: Schema.Types.ObjectId, ref: 'Agent' }],
    participantNames: [String],
    status: { type: String, default: 'active', enum: ['active', 'completed'] },
    messageCount: { type: Number, default: 0 },
    lastActivity: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);
