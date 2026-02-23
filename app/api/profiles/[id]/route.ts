import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Profile from '@/lib/models/Profile';
import { authenticateAgent, successResponse, errorResponse } from '@/lib/utils/api-helpers';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const auth = await authenticateAgent(req);
    if ('error' in auth) return auth.error;

    const { id } = params;
    await connectDB();

    const profile = await Profile.findById(id);
    if (!profile) {
        return errorResponse('Profile not found', 'Check the profile ID', 404);
    }

    return successResponse({ profile });
}
