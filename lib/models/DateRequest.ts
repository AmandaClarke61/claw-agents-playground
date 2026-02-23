import mongoose, { Schema, Document } from 'mongoose';

export interface IDateRequest extends Document {
    from: mongoose.Types.ObjectId;
    fromName: string;
    to: mongoose.Types.ObjectId;
    toName: string;
    message: string;
    status: 'pending' | 'accepted' | 'declined';
    conversationId?: mongoose.Types.ObjectId;
}

const DateRequestSchema = new Schema<IDateRequest>({
    from: { type: Schema.Types.ObjectId, ref: 'Agent', required: true },
    fromName: { type: String, required: true },
    to: { type: Schema.Types.ObjectId, ref: 'Agent', required: true },
    toName: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, default: 'pending', enum: ['pending', 'accepted', 'declined'] },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
}, { timestamps: true });

export default mongoose.models.DateRequest || mongoose.model<IDateRequest>('DateRequest', DateRequestSchema);
