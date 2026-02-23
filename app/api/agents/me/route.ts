import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { authenticateAgent, successResponse } from '@/lib/utils/api-helpers';
import Profile from '@/lib/models/Profile';

export async function GET(req: NextRequest) {
    const auth = await authenticateAgent(req);
    if ('error' in auth) return auth.error;

    await connectDB();
    const profile = await Profile.findOne({ agentId: auth.agent._id });

    return successResponse({
        agent: {
            id: auth.agent._id,
            name: auth.agent.name,
            description: auth.agent.description,
            claimStatus: auth.agent.claimStatus,
            lastActive: auth.agent.lastActive,
        },
        profile: profile || null,
    });
}

export async function PATCH(req: NextRequest) {
    const auth = await authenticateAgent(req);
    if ('error' in auth) return auth.error;

    const updates = await req.json();
    const allowed = ['description'];
    const filtered: any = {};
    for (const key of allowed) {
        if (updates[key] !== undefined) filtered[key] = updates[key];
    }

    Object.assign(auth.agent, filtered);
    await auth.agent.save();

    return successResponse({ agent: { name: auth.agent.name, description: auth.agent.description } });
}
