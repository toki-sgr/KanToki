import React from 'react';

const SkeletonLoader = ({ count = 6 }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="glass-panel ship-card"
                    style={{
                        height: '240px',
                        animation: 'pulse 1.5s infinite ease-in-out'
                    }}
                >
                    <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%' }}>
                        <div style={{ width: '40%', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
                        <div style={{ width: '60%', height: '32px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
                        <div style={{ marginTop: 'auto', width: '100%', height: '100px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }} />
                    </div>
                </div>
            ))}
            <style>{`
                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 0.3; }
                    100% { opacity: 0.6; }
                }
            `}</style>
        </>
    );
};

export default SkeletonLoader;
