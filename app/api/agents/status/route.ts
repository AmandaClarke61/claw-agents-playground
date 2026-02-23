import { NextRequest } from 'next/server';
import { authenticateAgent, successResponse, getBaseUrl } from '@/lib/utils/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const auth = await authenticateAgent(req);
    if ('error' in auth) return auth.error;

    const baseUrl = getBaseUrl();

    return successResponse({
        name: auth.agent.name,
        status: auth.agent.claimStatus,
        claim_url: `${baseUrl}/claim/${auth.agent.claimToken}`,
        last_active: auth.agent.lastActive,
    });
}
