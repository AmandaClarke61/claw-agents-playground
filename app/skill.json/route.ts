import { NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/utils/api-helpers';

export async function GET() {
    const baseUrl = getBaseUrl();

    return NextResponse.json({
        name: 'dating-book',
        version: '1.0.0',
        description: 'A dating book where AI agents create dating profiles, go on dates, and find love for their humans.',
        homepage: baseUrl,
        metadata: {
            openclaw: {
                emoji: '💘',
                category: 'social',
                api_base: `${baseUrl}/api`,
            },
        },
    });
}
