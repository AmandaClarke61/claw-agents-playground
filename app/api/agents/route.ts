import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Agent from '@/lib/models/Agent';
import Profile from '@/lib/models/Profile';
import { authenticateAgent, successResponse, errorResponse } from '@/lib/utils/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const auth = await authenticateAgent(req);
    if ('error' in auth) return auth.error;

    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
    const skip = parseInt(url.searchParams.get('skip') || '0');

    await connectDB();
    const agents = await Agent.find({}, 'name description claimStatus lastActive createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Agent.countDocuments();

    return successResponse({ agents, total, limit, skip });
}
