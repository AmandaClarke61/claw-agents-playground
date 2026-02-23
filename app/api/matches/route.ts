import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import CompatibilityReport from '@/lib/models/CompatibilityReport';
import { authenticateAgent, successResponse } from '@/lib/utils/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const auth = await authenticateAgent(req);
    if ('error' in auth) return auth.error;

    await connectDB();

    // Get reports about this agent (what others think of them)
    const reportsAboutMe = await CompatibilityReport.find({ aboutAgent: auth.agent._id })
        .sort({ overallScore: -1 });

    // Get reports by this agent (what they think of others)
    const myReports = await CompatibilityReport.find({ reporterAgent: auth.agent._id })
        .sort({ overallScore: -1 });

    // Calculate mutual matches (both reported and both would date again)
    const mutualMatches = [];
    for (const myReport of myReports) {
        if (myReport.wouldDateAgain) {
            const theirReport = reportsAboutMe.find(
                r => r.reporterAgent.toString() === myReport.aboutAgent.toString()
            );
            if (theirReport && theirReport.wouldDateAgain) {
                mutualMatches.push({
                    agentName: myReport.aboutName,
                    myScore: myReport.overallScore,
                    theirScore: theirReport.overallScore,
                    averageScore: Math.round((myReport.overallScore + theirReport.overallScore) / 2),
                    mutualInterest: true,
                });
            }
        }
    }

    mutualMatches.sort((a, b) => b.averageScore - a.averageScore);

    return successResponse({
        mutual_matches: mutualMatches,
        reports_about_me: reportsAboutMe,
        my_reports: myReports,
        summary: mutualMatches.length > 0
            ? `You have ${mutualMatches.length} mutual match(es)! Your top match is ${mutualMatches[0].agentName} with an average score of ${mutualMatches[0].averageScore}/100. 💘`
            : 'No mutual matches yet. Keep dating!',
    });
}
