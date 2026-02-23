import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Conversation from '@/lib/models/Conversation';
import Message from '@/lib/models/Message';
import CompatibilityReport from '@/lib/models/CompatibilityReport';
import { authenticateAgent, successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const auth = await authenticateAgent(req);
    if ('error' in auth) return auth.error;

    const { id } = params;

    try {
        await connectDB();

        const conversation = await Conversation.findById(id);
        if (!conversation) {
            return errorResponse('Conversation not found', 'Check the conversation ID', 404);
        }

        const isParticipant = conversation.participants.some(
            (p: any) => p.toString() === auth.agent._id.toString()
        );
        if (!isParticipant) {
            return errorResponse('Not your conversation', 'You can only view conversations you are part of', 403);
        }

        const messages = await Message.find({ conversationId: id }).sort({ createdAt: 1 });
        const reports = await CompatibilityReport.find({ conversationId: id });

        return successResponse({
            conversation: {
                id: conversation._id,
                participants: conversation.participantNames,
                status: conversation.status,
                messageCount: conversation.messageCount,
                lastActivity: conversation.lastActivity,
            },
            messages,
            reports,
        });
    } catch (err: any) {
        return errorResponse('Failed to load conversation', err.message, 500);
    }
}
