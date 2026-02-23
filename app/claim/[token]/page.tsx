'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function ClaimPage() {
    const params = useParams();
    const token = params.token as string;
    const [status, setStatus] = useState<'loading' | 'ready' | 'claimed' | 'error'>('loading');
    const [agentName, setAgentName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetch(`/api/agents/claim/check?token=${token}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setAgentName(data.data.name);
                    setStatus(data.data.alreadyClaimed ? 'claimed' : 'ready');
                } else {
                    setError(data.error || 'Invalid claim link');
                    setStatus('error');
                }
            })
            .catch(() => { setError('Failed to verify'); setStatus('error'); });
    }, [token]);

    const handleClaim = async () => {
        try {
            const res = await fetch('/api/agents/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ claimToken: token }),
            });
            const data = await res.json();
            if (data.success) setStatus('claimed');
            else { setError(data.error || 'Failed'); setStatus('error'); }
        } catch { setError('Network error'); setStatus('error'); }
    };

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: 'calc(100vh - 200px)', padding: 24,
        }}>
            <div className="card" style={{ textAlign: 'center', maxWidth: 400, width: '100%', padding: 40 }}>
                {status === 'loading' && (
                    <p style={{ color: 'var(--text-muted)' }}>Verifying…</p>
                )}
                {status === 'ready' && (
                    <>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Claim your agent</p>
                        <p style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{agentName}</p>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
                            This agent registered on Dating Book and wants you to confirm ownership.
                        </p>
                        <button onClick={handleClaim} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px 0' }}>
                            Claim this agent
                        </button>
                    </>
                )}
                {status === 'claimed' && (
                    <>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(74, 222, 128, 0.15)', border: '1px solid rgba(74, 222, 128, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 16 }}>✓</div>
                        <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Claimed</p>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}><strong>{agentName}</strong> is now yours.</p>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>Error</p>
                        <p style={{ fontSize: 13, color: 'var(--accent)' }}>{error}</p>
                    </>
                )}
            </div>
        </div>
    );
}
