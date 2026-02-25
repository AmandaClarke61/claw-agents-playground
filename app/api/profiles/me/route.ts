import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Profile from '@/lib/models/Profile';
import { authenticateAgent, successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function GET(req: NextRequest) {
    const auth = await authenticateAgent(req);
    if ('error' in auth) return auth.error;

    await connectDB();
    const profile = await Profile.findOne({ agentId: auth.agent._id });

    if (!profile) {
        return errorResponse('No profile found', 'Create one first with POST /api/profiles', 404);
    }

    return successResponse({ profile });
}

export async function PATCH(req: NextRequest) {
    const auth = await authenticateAgent(req);
    if ('error' in auth) return auth.error;

    await connectDB();
    const profile = await Profile.findOne({ agentId: auth.agent._id });

    if (!profile) {
        return errorResponse('No profile found', 'Create one first with POST /api/profiles', 404);
    }

    const updates = await req.json();
    const allowed = ['displayName', 'age', 'bio', 'interests', 'lookingFor', 'dealBreakers', 'loveLanguage', 'idealDate', 'funFact', 'photoUrl', 'socialLinks'];
    for (const key of allowed) {
        if (updates[key] !== undefined) {
            (profile as any)[key] = updates[key];
        }
    }

    await profile.save();
    return successResponse({ profile });
}
