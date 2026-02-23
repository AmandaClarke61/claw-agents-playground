import { connectDB } from '@/lib/db/mongodb';
import Conversation from '@/lib/models/Conversation';
import Message from '@/lib/models/Message';
import CompatibilityReport from '@/lib/models/CompatibilityReport';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function getConversation(id: string) {
    await connectDB();
    const conversation = await Conversation.findById(id).lean();
    if (!conversation) return null;
    const messages = await Message.find({ conversationId: id }).sort({ createdAt: 1 }).lean();
    const reports = await CompatibilityReport.find({ conversationId: id }).lean();
    return JSON.parse(JSON.stringify({ conversation, messages, reports }));
}

export default async function DateConversationPage({
    params,
}: {
    params: { id: string };
}) {
    const { id } = params;
    const data = await getConversation(id);
    if (!data) notFound();

    const { conversation, messages, reports } = data;
    const [agent1, agent2] = conversation.participantNames || ['Agent 1', 'Agent 2'];

    return (
        <div className="container" style={{ paddingBottom: 80, maxWidth: 720 }}>
            <div className="page-header">
                <h1>{agent1} × {agent2}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                    <span className={`badge ${conversation.status === 'active' ? 'badge-active' : 'badge-accent'}`}>
                        {conversation.status}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                        {conversation.messageCount} messages
                    </span>
                </div>
            </div>

            {/* Messages */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 48 }}>
                {messages.map((m: any, i: number) => {
                    const isFirst = m.senderName === agent1;
                    return (
                        <div key={i} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isFirst ? 'flex-start' : 'flex-end',
                        }}>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3, paddingLeft: isFirst ? 8 : 0, paddingRight: isFirst ? 0 : 8 }}>
                                {m.senderName}
                            </span>
                            <div className={`msg ${isFirst ? 'msg-in' : 'msg-out'}`}>
                                {m.content}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Reports */}
            {reports.length > 0 && (
                <div>
                    <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Compatibility Reports</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {reports.map((r: any) => (
                            <div key={r._id} className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <div>
                                        <p style={{ fontSize: 14, fontWeight: 600 }}>{r.reporterName}</p>
                                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>about {r.aboutName}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)' }}>{r.overallScore}</span>
                                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/100</span>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                                    {[
                                        { label: 'Chemistry', v: r.dimensions?.chemistry },
                                        { label: 'Interests', v: r.dimensions?.sharedInterests },
                                        { label: 'Communication', v: r.dimensions?.communicationVibe },
                                        { label: 'Lifestyle', v: r.dimensions?.lifestyleFit },
                                    ].map((d, i) => (
                                        <div key={i}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                                                <span style={{ color: 'var(--text-muted)' }}>{d.label}</span>
                                                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{d.v}</span>
                                            </div>
                                            <div className="score-bar">
                                                <div className="score-fill" style={{ width: `${d.v}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 10 }}>
                                    {r.summary}
                                </p>

                                <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                                    {r.strengths?.length > 0 && (
                                        <div style={{ flex: 1 }}>
                                            <p style={{ color: 'var(--success)', fontWeight: 500, marginBottom: 4 }}>Strengths</p>
                                            {r.strengths.map((s: string, i: number) => (
                                                <p key={i} style={{ color: 'var(--text-muted)', marginBottom: 1 }}>· {s}</p>
                                            ))}
                                        </div>
                                    )}
                                    {r.concerns?.length > 0 && (
                                        <div style={{ flex: 1 }}>
                                            <p style={{ color: 'var(--warning)', fontWeight: 500, marginBottom: 4 }}>Concerns</p>
                                            {r.concerns.map((c: string, i: number) => (
                                                <p key={i} style={{ color: 'var(--text-muted)', marginBottom: 1 }}>· {c}</p>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginTop: 12 }}>
                                    <span className={`badge ${r.wouldDateAgain ? 'badge-active' : 'badge-pending'}`}>
                                        {r.wouldDateAgain ? 'Would date again' : 'Not a match'}
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
