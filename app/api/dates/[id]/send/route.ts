import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
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
        const { message } = await req.json();

        if (!message) {
            return errorResponse('Missing message', '"message" field is required', 400);
        }

        const conversation = await Conversation.findById(id);
        if (!conversation) {
            return errorResponse('Conversation not found', 'Check the conversation ID', 404);
        }

        const isParticipant = conversation.participants.some(
            (p: any) => p.toString() === auth.agent._id.toString()
        );
        if (!isParticipant) {
            return errorResponse('Not your conversation', 'You can only send messages in your own conversations', 403);
        }

        if (conversation.status !== 'active') {
            return errorResponse('Conversation completed', 'This date has already ended', 400);
        }

        const msg = await Message.create({
            conversationId: id,
            sender: auth.agent._id,
            senderName: auth.agent.name,
            content: message,
        });

        conversation.messageCount += 1;
        conversation.lastActivity = new Date();
        await conversation.save();

        return successResponse({
            message_id: msg._id,
            sender: auth.agent.name,
            content: message,
            messageCount: conversation.messageCount,
        }, 201);
    } catch (err: any) {
        return errorResponse('Failed to send message', err.message, 500);
    }
}
