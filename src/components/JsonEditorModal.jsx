import React, { useState, useEffect } from 'react';

const JsonEditorModal = ({ isOpen, onClose, onSave, onDelete, initialData, title }) => {
    const [jsonContent, setJsonContent] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && initialData) {
            setJsonContent(JSON.stringify(initialData, null, 4));
            setError('');
        }
    }, [isOpen, initialData]);

    const handleSave = () => {
        try {
            const parsed = JSON.parse(jsonContent);
            onSave(parsed);
            onClose();
        } catch (e) {
            setError('Invalid JSON: ' + e.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="glass-panel animate-fade-in" style={{
                width: '90%',
                maxWidth: '800px',
                height: '85vh',
                display: 'flex',
                flexDirection: 'column',
                padding: 'var(--space-6)',
                background: '#1a1b23', /* Darker opaque bg for code readability */
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                    <div className="flex-col" style={{ gap: '4px' }}>
                        <h2 className="text-xl font-bold text-pri">{title}</h2>
                        <span className="text-sm text-sec">Edit raw JSON data directly.</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn-icon"
                        style={{ fontSize: '1.2rem' }}
                    >
                        ×
                    </button>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(248, 113, 113, 0.1)',
                        borderLeft: '3px solid var(--accent-red)',
                        color: 'var(--accent-red)',
                        padding: '12px',
                        marginBottom: '16px',
                        borderRadius: '4px',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <textarea
                    value={jsonContent}
                    onChange={(e) => setJsonContent(e.target.value)}
                    style={{
                        flex: 1,
                        background: '#0f1014',
                        color: '#f1f5f9',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        padding: '16px',
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        fontSize: '0.9rem',
                        lineHeight: '1.5',
                        resize: 'none',
                        outline: 'none',
                        marginBottom: 'var(--space-6)'
                    }}
                    spellCheck="false"
                />

                <div className="flex-row" style={{ justifyContent: 'space-between' }}>
                    {onDelete ? (
                        <button
                            onClick={() => {
                                if (window.confirm('Are you sure you want to delete this ship? This cannot be undone.')) {
                                    onDelete();
                                    onClose();
                                }
                            }}
                            className="text-sm font-bold"
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                background: 'rgba(248, 113, 113, 0.1)',
                                border: '1px solid rgba(248, 113, 113, 0.2)',
                                color: 'var(--accent-red)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(248, 113, 113, 0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(248, 113, 113, 0.1)'}
                        >
                            Delete Ship
                        </button>
                    ) : <div />}

                    <div className="flex-row" style={{ gap: '12px' }}>
                        <button
                            onClick={onClose}
                            className="text-sm font-medium text-sec"
                            style={{
                                padding: '10px 20px',
                                borderRadius: '8px',
                                background: 'transparent',
                                border: '1px solid transparent',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="text-sm font-bold"
                            style={{
                                padding: '10px 24px',
                                borderRadius: '8px',
                                background: 'var(--accent-primary)',
                                border: '1px solid var(--accent-primary)',
                                color: '#0f172a',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 6px -1px rgba(56, 189, 248, 0.3)'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(56, 189, 248, 0.4)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(56, 189, 248, 0.3)';
                            }}
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JsonEditorModal;
