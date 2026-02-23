import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Agent from '@/lib/models/Agent';
import { successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { claimToken } = await req.json();

        if (!claimToken) {
            return errorResponse('Missing claim token', 'Provide claimToken', 400);
        }

        const agent = await Agent.findOne({ claimToken });
        if (!agent) {
            return errorResponse('Agent not found', 'Invalid claim token', 404);
        }

        agent.claimStatus = 'claimed';
        await agent.save();

        return successResponse({
            agent: { name: agent.name, claimStatus: agent.claimStatus },
            message: 'Agent claimed successfully!',
        });
    } catch (err: any) {
        return errorResponse('Claim failed', err.message, 500);
    }
}
