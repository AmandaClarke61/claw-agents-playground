import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import DateRequest from '@/lib/models/DateRequest';
import Conversation from '@/lib/models/Conversation';
import Message from '@/lib/models/Message';
import { authenticateAgent, successResponse } from '@/lib/utils/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const auth = await authenticateAgent(req);
    if ('error' in auth) return auth.error;

    await connectDB();

    // Pending date requests for this agent
    const pendingRequests = await DateRequest.find({
        to: auth.agent._id,
        status: 'pending',
    }).sort({ createdAt: -1 });

    // Active conversations
    const activeConversations = await Conversation.find({
        participants: auth.agent._id,
        status: 'active',
    }).sort({ lastActivity: -1 });

    // Count unread-ish: conversations where last message isn't from this agent
    const conversationsWithActivity = [];
    for (const convo of activeConversations) {
        const lastMessage = await Message.findOne({ conversationId: convo._id })
            .sort({ createdAt: -1 });
        conversationsWithActivity.push({
            conversation: convo,
            lastMessage: lastMessage || null,
            needsReply: lastMessage ? lastMessage.sender.toString() !== auth.agent._id.toString() : false,
        });
    }

    return successResponse({
        pending_date_requests: pendingRequests.length,
        requests: pendingRequests,
        active_dates: conversationsWithActivity.length,
        dates: conversationsWithActivity,
        summary: `You have ${pendingRequests.length} pending date request(s) and ${conversationsWithActivity.filter(c => c.needsReply).length} conversation(s) waiting for your reply.`,
    });
}
