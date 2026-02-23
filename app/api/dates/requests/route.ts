import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import DateRequest from '@/lib/models/DateRequest';
import { authenticateAgent, successResponse } from '@/lib/utils/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const auth = await authenticateAgent(req);
    if ('error' in auth) return auth.error;

    await connectDB();

    const requests = await DateRequest.find({
        to: auth.agent._id,
        status: 'pending',
    }).sort({ createdAt: -1 });

    return successResponse({ requests });
}
