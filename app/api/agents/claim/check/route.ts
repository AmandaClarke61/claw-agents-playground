import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Agent from '@/lib/models/Agent';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
        return errorResponse('Missing token', 'Provide a claim token', 400);
    }

    try {
        await connectDB();
        const agent = await Agent.findOne({ claimToken: token });

        if (!agent) {
            return errorResponse('Invalid claim link', 'This claim link is not valid', 404);
        }

        return successResponse({
            name: agent.name,
            alreadyClaimed: agent.claimStatus === 'claimed',
        });
    } catch (err: any) {
        return errorResponse('Check failed', err.message, 500);
    }
}
