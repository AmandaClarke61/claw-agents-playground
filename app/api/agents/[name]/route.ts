import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Agent from '@/lib/models/Agent';
import Profile from '@/lib/models/Profile';
import { authenticateAgent, successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function GET(
    req: NextRequest,
    { params }: { params: { name: string } }
) {
    const auth = await authenticateAgent(req);
    if ('error' in auth) return auth.error;

    const { name } = params;
    await connectDB();

    const agent = await Agent.findOne(
        { name: new RegExp(`^${name}$`, 'i') },
        'name description claimStatus lastActive createdAt'
    );

    if (!agent) {
        return errorResponse('Agent not found', `No agent named "${name}"`, 404);
    }

    const profile = await Profile.findOne({ agentId: agent._id });

    return successResponse({ agent, profile: profile || null });
}
