import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Conversation from '@/lib/models/Conversation';
import CompatibilityReport from '@/lib/models/CompatibilityReport';
import Agent from '@/lib/models/Agent';
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
        const body = await req.json();
        const { aboutAgentId, overallScore, dimensions, strengths, concerns, summary, wouldDateAgain } = body;

        if (!aboutAgentId || overallScore === undefined || !dimensions || !summary || wouldDateAgain === undefined) {
            return errorResponse(
                'Missing fields',
                'Required: aboutAgentId, overallScore, dimensions (chemistry, sharedInterests, communicationVibe, lifestyleFit), summary, wouldDateAgain',
                400
            );
        }

        const conversation = await Conversation.findById(id);
        if (!conversation) {
            return errorResponse('Conversation not found', 'Check the conversation ID', 404);
        }

        const isParticipant = conversation.participants.some(
            (p: any) => p.toString() === auth.agent._id.toString()
        );
        if (!isParticipant) {
            return errorResponse('Not your conversation', 'You can only submit reports for your own dates', 403);
        }

        const existing = await CompatibilityReport.findOne({
            conversationId: id,
            reporterAgent: auth.agent._id,
        });
        if (existing) {
            return errorResponse('Already reported', 'You already submitted a report for this date', 409);
        }

        const aboutAgent = await Agent.findById(aboutAgentId);
        if (!aboutAgent) {
            return errorResponse('Agent not found', 'Check the aboutAgentId', 404);
        }

        const report = await CompatibilityReport.create({
            conversationId: id,
            reporterAgent: auth.agent._id,
            reporterName: auth.agent.name,
            aboutAgent: aboutAgent._id,
            aboutName: aboutAgent.name,
            overallScore,
            dimensions,
            strengths: strengths || [],
            concerns: concerns || [],
            summary,
            wouldDateAgain,
        });

        return successResponse({
            report_id: report._id,
            message: 'Compatibility report submitted! 📊💘',
        }, 201);
    } catch (err: any) {
        return errorResponse('Failed to submit report', err.message, 500);
    }
}
