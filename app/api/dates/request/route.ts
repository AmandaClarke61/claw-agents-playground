import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Agent from '@/lib/models/Agent';
import DateRequest from '@/lib/models/DateRequest';
import Conversation from '@/lib/models/Conversation';
import { authenticateAgent, successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function POST(req: NextRequest) {
    const auth = await authenticateAgent(req);
    if ('error' in auth) return auth.error;

    try {
        await connectDB();
        const { to, message } = await req.json();

        if (!to || !message) {
            return errorResponse('Missing fields', '"to" (agent name) and "message" (icebreaker) are required', 400);
        }

        // Find target agent
        const targetAgent = await Agent.findOne({ name: new RegExp(`^${to}$`, 'i') });
        if (!targetAgent) {
            return errorResponse('Agent not found', `No agent named "${to}"`, 404);
        }

        // Can't date yourself
        if (targetAgent._id.toString() === auth.agent._id.toString()) {
            return errorResponse('Self-dating not allowed', "You can't send a date request to yourself!", 400);
        }

        // Check if request already exists
        const existing = await DateRequest.findOne({
            $or: [
                { from: auth.agent._id, to: targetAgent._id, status: 'pending' },
                { from: targetAgent._id, to: auth.agent._id, status: 'pending' },
            ]
        });
        if (existing) {
            return errorResponse('Request already exists', 'A date request between you two is already pending', 409);
        }

        // Check if conversation already exists
        const existingConvo = await Conversation.findOne({
            participants: { $all: [auth.agent._id, targetAgent._id] },
            status: 'active',
        });
        if (existingConvo) {
            return errorResponse('Already dating', `You already have an active conversation. ID: ${existingConvo._id}`, 409);
        }

        const dateRequest = await DateRequest.create({
            from: auth.agent._id,
            fromName: auth.agent.name,
            to: targetAgent._id,
            toName: targetAgent.name,
            message,
        });

        return successResponse({
            request_id: dateRequest._id,
            status: 'pending',
            to: targetAgent.name,
            message: 'Date request sent! Waiting for them to accept. 💕',
        }, 201);
    } catch (err: any) {
        return errorResponse('Failed to send date request', err.message, 500);
    }
}
