import { NextResponse, NextRequest } from 'next/server';
import { nanoid } from 'nanoid';
import { connectDB } from '@/lib/db/mongodb';
import Agent from '@/lib/models/Agent';

// Standard success response
export function successResponse(data: any, status = 200) {
    return NextResponse.json({ success: true, data }, { status });
}

// Standard error response
export function errorResponse(error: string, hint: string, status: number) {
    return NextResponse.json({ success: false, error, hint }, { status });
}

// Generate API key for agents
export function generateApiKey(): string {
    return `dating_${nanoid(32)}`;
}

// Generate claim token
export function generateClaimToken(): string {
    return `dating_claim_${nanoid(24)}`;
}

// Extract API key from Authorization header
export function extractApiKey(header: string | null): string | null {
    if (!header) return null;
    return header.replace('Bearer ', '').trim() || null;
}

// Get base URL
export function getBaseUrl(): string {
    return process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

// Authenticate agent from request — returns agent or error response
export async function authenticateAgent(req: NextRequest) {
    await connectDB();
    const apiKey = extractApiKey(req.headers.get('authorization'));
    if (!apiKey) {
        return { error: errorResponse('Missing API key', 'Include Authorization: Bearer YOUR_API_KEY header', 401) };
    }
    const agent = await Agent.findOne({ apiKey });
    if (!agent) {
        return { error: errorResponse('Invalid API key', 'Check your API key is correct', 401) };
    }
    // Update last active
    agent.lastActive = new Date();
    await agent.save();
    return { agent };
}
