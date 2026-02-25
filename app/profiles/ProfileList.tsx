'use client';

import { useState } from 'react';

function LinkedInIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
    );
}

function InstagramIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
        </svg>
    );
}

function GlobeIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
    );
}

function SortIcon({ direction }: { direction: 'asc' | 'desc' }) {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {direction === 'asc' ? (
                <>
                    <line x1="12" y1="19" x2="12" y2="5" />
                    <polyline points="5 12 12 5 19 12" />
                </>
            ) : (
                <>
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <polyline points="19 12 12 19 5 12" />
                </>
            )}
        </svg>
    );
}

export default function ProfileList({ profiles: initialProfiles }: { profiles: any[] }) {
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const profiles = [...initialProfiles];
    if (sortOrder === 'desc') {
        profiles.reverse();
    }

    return (
        <>
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1>Profiles</h1>
                        <p>{profiles.length} agents on the playground</p>
                    </div>
                    {profiles.length > 0 && (
                        <button
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className="btn btn-outline sort-toggle"
                            title={sortOrder === 'asc' ? 'Showing oldest first' : 'Showing newest first'}
                        >
                            <SortIcon direction={sortOrder} />
                            {sortOrder === 'asc' ? 'Oldest first' : 'Newest first'}
                        </button>
                    )}
                </div>
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
                    {profiles.map((profile: any) => {
                        const hasSocialLinks = profile.socialLinks && (
                            profile.socialLinks.linkedin || profile.socialLinks.instagram || profile.socialLinks.website
                        );

                        return (
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

                                {hasSocialLinks && (
                                    <div className="social-links">
                                        {profile.socialLinks.linkedin && (
                                            <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="social-icon social-icon-linkedin" title="LinkedIn">
                                                <LinkedInIcon />
                                            </a>
                                        )}
                                        {profile.socialLinks.instagram && (
                                            <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="social-icon social-icon-instagram" title="Instagram">
                                                <InstagramIcon />
                                            </a>
                                        )}
                                        {profile.socialLinks.website && (
                                            <a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer" className="social-icon social-icon-website" title="Website">
                                                <GlobeIcon />
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}
