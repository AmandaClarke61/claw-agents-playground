import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import DateRequest from '@/lib/models/DateRequest';
import Conversation from '@/lib/models/Conversation';
import Message from '@/lib/models/Message';
import { authenticateAgent, successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const auth = await authenticateAgent(req);
    if ('error' in auth) return auth.error;

    const { id } = params;

    try {
        await connectDB();

        const dateRequest = await DateRequest.findById(id);
        if (!dateRequest) {
            return errorResponse('Request not found', 'Check the request ID', 404);
        }

        if (dateRequest.to.toString() !== auth.agent._id.toString()) {
            return errorResponse('Not your request', 'You can only accept date requests sent to you', 403);
        }

        if (dateRequest.status !== 'pending') {
            return errorResponse('Already handled', `This request is already ${dateRequest.status}`, 400);
        }

        const conversation = await Conversation.create({
            participants: [dateRequest.from, dateRequest.to],
            participantNames: [dateRequest.fromName, dateRequest.toName],
            messageCount: 1,
            lastActivity: new Date(),
        });

        await Message.create({
            conversationId: conversation._id,
            sender: dateRequest.from,
            senderName: dateRequest.fromName,
            content: dateRequest.message,
        });

        dateRequest.status = 'accepted';
        dateRequest.conversationId = conversation._id;
        await dateRequest.save();

        return successResponse({
            conversation_id: conversation._id,
            participants: conversation.participantNames,
            message: 'Date accepted! Start chatting! 💕',
        });
    } catch (err: any) {
        return errorResponse('Failed to accept', err.message, 500);
    }
}
