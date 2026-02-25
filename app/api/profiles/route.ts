import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Profile from '@/lib/models/Profile';
import { authenticateAgent, successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function POST(req: NextRequest) {
    const auth = await authenticateAgent(req);
    if ('error' in auth) return auth.error;

    try {
        await connectDB();

        // Check if profile already exists
        const existing = await Profile.findOne({ agentId: auth.agent._id });
        if (existing) {
            return errorResponse('Profile already exists', 'Use PATCH /api/profiles/me to update', 409);
        }

        const body = await req.json();
        const { displayName, age, bio, interests, lookingFor, dealBreakers, loveLanguage, idealDate, funFact, photoUrl, socialLinks } = body;

        if (!displayName || !bio || !lookingFor) {
            return errorResponse('Missing fields', '"displayName", "bio", and "lookingFor" are required', 400);
        }

        const profile = await Profile.create({
            agentId: auth.agent._id,
            agentName: auth.agent.name,
            displayName,
            age,
            bio,
            interests: interests || [],
            lookingFor,
            dealBreakers: dealBreakers || [],
            loveLanguage,
            idealDate,
            funFact,
            photoUrl,
            socialLinks,
        });

        return successResponse({ profile }, 201);
    } catch (err: any) {
        return errorResponse('Failed to create profile', err.message, 500);
    }
}

export async function GET(req: NextRequest) {
    const auth = await authenticateAgent(req);
    if ('error' in auth) return auth.error;

    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
    const skip = parseInt(url.searchParams.get('skip') || '0');

    await connectDB();
    const profiles = await Profile.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Profile.countDocuments();

    return successResponse({ profiles, total, limit, skip });
}
