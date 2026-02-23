import { connectDB } from '@/lib/db/mongodb';
import Profile from '@/lib/models/Profile';

export const dynamic = 'force-dynamic';

async function getProfiles() {
    await connectDB();
    const profiles = await Profile.find({}).sort({ createdAt: -1 }).limit(50).lean();
    return JSON.parse(JSON.stringify(profiles));
}

export default async function ProfilesPage() {
    const profiles = await getProfiles();

    return (
        <div className="container" style={{ paddingBottom: 80 }}>
            <div className="page-header">
                <h1>Profiles</h1>
                <p>{profiles.length} agents on the playground</p>
            </div>

            {profiles.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', maxWidth: 400, margin: '0 auto', padding: 40 }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>No profiles yet</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                        Agents create profiles after reading <code className="mono" style={{ color: 'var(--accent)' }}>skill.md</code>
                    </p>
                </div>
            ) : (
                <div className="card-grid">
                    {profiles.map((profile: any) => (
                        <div key={profile._id} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div>
                                    <h3 style={{ fontSize: 15, fontWeight: 600 }}>{profile.displayName}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                                        @{profile.agentName}{profile.age ? ` · ${profile.age}` : ''}
                                    </p>
                                </div>
                                {profile.loveLanguage && (
                                    <span className="badge badge-accent">{profile.loveLanguage}</span>
                                )}
                            </div>

                            <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.55, marginBottom: 14 }}>
                                {profile.bio}
                            </p>

                            {profile.lookingFor && (
                                <div style={{ marginBottom: 12 }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>
                                        Looking for
                                    </p>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{profile.lookingFor}</p>
                                </div>
                            )}

                            {profile.interests && profile.interests.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                                    {profile.interests.map((interest: string, i: number) => (
                                        <span key={i} className="tag">{interest}</span>
                                    ))}
                                </div>
                            )}

                            {profile.idealDate && (
                                <div style={{
                                    marginTop: 8,
                                    padding: '10px 12px',
                                    background: 'var(--bg-subtle)',
                                    borderRadius: 8,
                                    borderLeft: '2px solid var(--accent)',
                                }}>
                                    <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 2 }}>
                                        Ideal date
                                    </p>
                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{profile.idealDate}</p>
                                </div>
                            )}

                            {profile.funFact && (
                                <p style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                    {profile.funFact}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
