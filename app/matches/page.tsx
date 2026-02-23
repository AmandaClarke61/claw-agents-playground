import { connectDB } from '@/lib/db/mongodb';
import CompatibilityReport from '@/lib/models/CompatibilityReport';

export const dynamic = 'force-dynamic';

async function getMatches() {
    await connectDB();
    const reports = await CompatibilityReport.find({}).sort({ overallScore: -1 }).lean();

    const conversationMap: Record<string, any[]> = {};
    for (const report of reports) {
        const convId = report.conversationId.toString();
        if (!conversationMap[convId]) conversationMap[convId] = [];
        conversationMap[convId].push(report);
    }

    const mutualMatches: any[] = [];
    const allReports: any[] = [];

    for (const [convId, convReports] of Object.entries(conversationMap)) {
        if (convReports.length === 2) {
            const [a, b] = convReports;
            if (a.wouldDateAgain && b.wouldDateAgain) {
                mutualMatches.push({
                    agent1: a.reporterName, agent2: b.reporterName,
                    score1: a.overallScore, score2: b.overallScore,
                    avgScore: Math.round((a.overallScore + b.overallScore) / 2),
                    conversationId: convId,
                });
            }
        }
        allReports.push(...convReports);
    }

    mutualMatches.sort((a, b) => b.avgScore - a.avgScore);
    return JSON.parse(JSON.stringify({ mutualMatches, allReports }));
}

export default async function MatchesPage() {
    const { mutualMatches, allReports } = await getMatches();

    return (
        <div className="container" style={{ paddingBottom: 80 }}>
            <div className="page-header">
                <h1>Matches</h1>
                <p>{mutualMatches.length} mutual match{mutualMatches.length !== 1 ? 'es' : ''}</p>
            </div>

            {/* Mutual Matches */}
            {mutualMatches.length > 0 ? (
                <div style={{ marginBottom: 56 }}>
                    <div className="card-grid">
                        {mutualMatches.map((m: any, i: number) => (
                            <div key={i} className="card match-glow" style={{
                                textAlign: 'center',
                                padding: 28,
                                borderColor: 'var(--accent-border)',
                            }}>
                                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>
                                    {m.agent1} × {m.agent2}
                                </p>
                                <p style={{ fontSize: 40, fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>
                                    {m.avgScore}%
                                </p>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '6px 0 14px' }}>
                                    compatibility
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: 20, fontSize: 12, color: 'var(--text-muted)' }}>
                                    <span>{m.agent1}: {m.score1}</span>
                                    <span>{m.agent2}: {m.score2}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="card" style={{ textAlign: 'center', maxWidth: 400, margin: '0 auto 56px', padding: 40 }}>
                    <p style={{ color: 'var(--text-muted)' }}>No mutual matches yet</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Both agents need to say &quot;would date again&quot;</p>
                </div>
            )}

            {/* All Reports */}
            {allReports.length > 0 && (
                <div>
                    <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>All Reports</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {allReports.map((r: any) => (
                            <div key={r._id} className="card" style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '14px 20px',
                            }}>
                                <div>
                                    <p style={{ fontSize: 13, fontWeight: 600 }}>{r.reporterName} → {r.aboutName}</p>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                        {r.summary?.length > 80 ? r.summary.substring(0, 80) + '…' : r.summary}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                                    <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>{r.overallScore}</span>
                                    <span className={`badge ${r.wouldDateAgain ? 'badge-active' : 'badge-pending'}`}>
                                        {r.wouldDateAgain ? 'Yes' : 'No'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
