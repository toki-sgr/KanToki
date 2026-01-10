import React from 'react';

const Banner = ({ activeTab, onTabChange }) => {
    return (
        <div className="banner glass-panel-no-border">
            {/* Logo Section */}
            <div className="app-brand flex-row" style={{ gap: 'var(--space-2)' }}>
                <img
                    src={`${import.meta.env.BASE_URL}kantoki.png`}
                    alt="Logo"
                    style={{ height: '4rem', display: 'block' }}
                />
                <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.1em' }}>
                    KanTOKI
                </span>
            </div>

            {/* Navigation Tabs */}
            <div className="flex-row" style={{ gap: 'var(--space-2)' }}>
                <button
                    className={`nav-tab ${activeTab === 'ships' ? 'active' : ''}`}
                    onClick={() => onTabChange('ships')}
                >
                    艦艇時記
                </button>
                <button
                    className={`nav-tab ${activeTab === 'quests' ? 'active' : ''}`}
                    onClick={() => onTabChange('quests')}
                >
                    任務時記
                </button>
            </div>
        </div>
    );
};

export default Banner;
