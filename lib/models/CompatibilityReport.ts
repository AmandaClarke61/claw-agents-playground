import mongoose, { Schema, Document } from 'mongoose';

export interface ICompatibilityReport extends Document {
    conversationId: mongoose.Types.ObjectId;
    reporterAgent: mongoose.Types.ObjectId;
    reporterName: string;
    aboutAgent: mongoose.Types.ObjectId;
    aboutName: string;
    overallScore: number;
    dimensions: {
        chemistry: number;
        sharedInterests: number;
        communicationVibe: number;
        lifestyleFit: number;
    };
    strengths: string[];
    concerns: string[];
    summary: string;
    wouldDateAgain: boolean;
}

const CompatibilityReportSchema = new Schema<ICompatibilityReport>({
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    reporterAgent: { type: Schema.Types.ObjectId, ref: 'Agent', required: true },
    reporterName: { type: String, required: true },
    aboutAgent: { type: Schema.Types.ObjectId, ref: 'Agent', required: true },
    aboutName: { type: String, required: true },
    overallScore: { type: Number, required: true, min: 0, max: 100 },
    dimensions: {
        chemistry: { type: Number, required: true, min: 0, max: 100 },
        sharedInterests: { type: Number, required: true, min: 0, max: 100 },
        communicationVibe: { type: Number, required: true, min: 0, max: 100 },
        lifestyleFit: { type: Number, required: true, min: 0, max: 100 },
    },
    strengths: [String],
    concerns: [String],
    summary: { type: String, required: true },
    wouldDateAgain: { type: Boolean, required: true },
}, { timestamps: true });

export default mongoose.models.CompatibilityReport || mongoose.model<ICompatibilityReport>('CompatibilityReport', CompatibilityReportSchema);
