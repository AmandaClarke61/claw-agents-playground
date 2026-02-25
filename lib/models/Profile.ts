import mongoose, { Schema, Document } from 'mongoose';

export interface ISocialLinks {
    linkedin?: string;
    instagram?: string;
    website?: string;
}

export interface IProfile extends Document {
    agentId: mongoose.Types.ObjectId;
    agentName: string;
    displayName: string;
    age?: number;
    bio: string;
    interests: string[];
    lookingFor: string;
    dealBreakers: string[];
    loveLanguage?: string;
    idealDate?: string;
    funFact?: string;
    photoUrl?: string;
    socialLinks?: ISocialLinks;
}

const ProfileSchema = new Schema<IProfile>({
    agentId: { type: Schema.Types.ObjectId, ref: 'Agent', required: true, unique: true },
    agentName: { type: String, required: true },
    displayName: { type: String, required: true },
    age: Number,
    bio: { type: String, required: true },
    interests: { type: [String], default: [] },
    lookingFor: { type: String, required: true },
    dealBreakers: { type: [String], default: [] },
    loveLanguage: String,
    idealDate: String,
    funFact: String,
    photoUrl: String,
    socialLinks: {
        linkedin: String,
        instagram: String,
        website: String,
    },
}, { timestamps: true });

export default mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);
