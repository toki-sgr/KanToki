import React, { useState, useEffect } from 'react';
import { useGitHubSync } from '../hooks/useGitHubSync';

const GitHubSyncModal = ({ isOpen, onClose, shipData }) => {
    const [token, setToken] = useState('');
    const { isSyncing, syncStatus, error, proposeChanges } = useGitHubSync();
    const [successUrl, setSuccessUrl] = useState(null);

    // Load token from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('github_pat');
        if (storedToken) setToken(storedToken);
    }, []);

    if (!isOpen) return null;

    const handleSync = async () => {
        if (!token) return;
        localStorage.setItem('github_pat', token);
        try {
            const prUrl = await proposeChanges(token, shipData);
            setSuccessUrl(prUrl);
        } catch (e) {
            // Error handled by hook
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
            <div className="glass-panel" onClick={e => e.stopPropagation()} style={{
                width: '100%', maxWidth: '480px', padding: '24px',
                border: '1px solid var(--glass-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                background: 'rgba(20, 20, 30, 0.95)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-pri">Propose Data Change</h2>
                        <p className="text-xs text-sec">Contribute to the KanToki database</p>
                    </div>
                </div>

                {!successUrl ? (
                    <>
                        <div style={{ marginBottom: '20px', fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                            This feature uses the <strong>GitHub API</strong> to automatically:
                            <ol style={{ marginLeft: '20px', listStyleType: 'decimal', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <li>Fork the repository to your account</li>
                                <li>Create a new branch with your changes</li>
                                <li>Open a <strong>Pull Request</strong> for review</li>
                            </ol>
                        </div>

                        <div className="form-group mb-4">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <label className="text-xs font-bold text-sec uppercase">GitHub Token (PAT)</label>
                                <a href="https://github.com/settings/tokens/new?scopes=public_repo&description=KanToki+Sync" target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline">
                                    Generate Token ↗
                                </a>
                            </div>
                            <input
                                type="password"
                                className="input-field w-full"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="ghp_xxxxxxxxxxxx"
                                disabled={isSyncing}
                                style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
                            />
                            <p className="text-xs text-tertiary mt-2">
                                Requires <code>public_repo</code> scope. Token is stored locally.
                            </p>
                        </div>

                        {error && (
                            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '16px' }}>
                                <strong>Error:</strong> {error}
                            </div>
                        )}

                        {isSyncing && (
                            <div style={{ marginBottom: '20px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span className="text-sm font-bold text-pri">Processing...</span>
                                    <span className="text-xs text-accent font-mono">{syncStatus}</span>
                                </div>
                                <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ width: '100%', height: '100%', background: 'var(--accent-primary)', animation: 'indeterminate 2s infinite linear', transformOrigin: '0% 50%' }}></div>
                                    <style>{`@keyframes indeterminate { 0% { transform: translateX(-100%) scaleX(0.2); } 50% { transform: translateX(0%) scaleX(0.5); } 100% { transform: translateX(100%) scaleX(0.2); } }`}</style>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end mt-4 pt-4" style={{
                            borderTop: '1px solid rgba(255,255,255,0.05)',
                            paddingTop: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: '16px' // Explicit gap
                        }}>
                            <button
                                onClick={onClose}
                                disabled={isSyncing}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: 'var(--text-secondary)',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    height: '40px' // Match height
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                    e.currentTarget.style.color = '#fff';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSync}
                                disabled={!token || isSyncing}
                                style={{
                                    background: !token || isSyncing ? 'rgba(255,255,255,0.05)' : 'var(--accent-primary)',
                                    color: !token || isSyncing ? 'rgba(255,255,255,0.3)' : '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '0 24px',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    cursor: !token || isSyncing ? 'not-allowed' : 'pointer',
                                    boxShadow: !token || isSyncing ? 'none' : '0 4px 12px rgba(56, 189, 248, 0.4)',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    height: '40px' // Match height
                                }}
                                onMouseOver={(e) => { if (token && !isSyncing) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                onMouseOut={(e) => { if (token && !isSyncing) e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                {isSyncing ? 'Syncing...' : 'Propose Changes'}
                                {!isSyncing && <span>→</span>}
                            </button>
                        </div>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚀</div>
                        <h3 className="text-xl font-bold text-pri mb-2">Pull Request Created!</h3>
                        <p className="text-sm text-sec mb-6">
                            Your changes have been successfully submitted for review.
                        </p>
                        <a
                            href={successUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            View on GitHub
                        </a>
                        <button
                            className="text-sm text-sec hover:text-pri"
                            style={{ display: 'block', margin: '20px auto 0', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GitHubSyncModal;
