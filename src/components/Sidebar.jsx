import React, { useState } from 'react';
import { calculateNeededResources, calculateTotalResources } from '../utils/dataUtils';
import { shipTypeAliases, getAllOrderedTypes } from '../data/shipTypeMappings';

const Sidebar = ({ ships, userState, onImport, onExport }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Progress Stats
    const totalShips = ships.length;
    let acquiredCount = 0;
    let fullyRemodeledCount = 0;

    // 2. Resource Calculation
    const totalNeeded = {};
    const totalPossible = {};

    // Type Stats
    const typeStats = {}; // { [Type]: { acquired: 0, remodeled: 0, total: 0 } }

    ships.forEach(ship => {
        // Init type stats
        if (!typeStats[ship.type]) typeStats[ship.type] = { acquired: 0, remodeled: 0, total: 0 };
        typeStats[ship.type].total += 1;

        const state = userState[ship.name] || {};
        const acquired = state.acquired;

        if (acquired) {
            acquiredCount++;
            typeStats[ship.type].acquired += 1;
        }

        // Check if fully remodeled
        const stages = state.stages || {};
        const lastStageIndex = ship.stages.length - 1;
        const isFullyRemodeled = stages[lastStageIndex] === true;

        if (isFullyRemodeled) {
            fullyRemodeledCount++;
            typeStats[ship.type].remodeled += 1; // Track remodeled per type
        }

        // Calculate needed resources
        let currentStageIndex = -1;
        if (state.stages) {
            const checkedIndices = Object.keys(state.stages).filter(k => state.stages[k]).map(Number);
            if (checkedIndices.length > 0) {
                currentStageIndex = Math.max(...checkedIndices);
            }
        }
        const neededForShip = calculateNeededResources(ship, currentStageIndex, acquired);
        Object.entries(neededForShip).forEach(([resName, count]) => {
            totalNeeded[resName] = (totalNeeded[resName] || 0) + count;
        });

        // 2. Total Possible (Denom)
        const totalForShip = calculateTotalResources(ship);
        Object.entries(totalForShip).forEach(([resName, count]) => {
            totalPossible[resName] = (totalPossible[resName] || 0) + count;
        });
    });

    // Sort types based on defined order
    const orderedTypes = getAllOrderedTypes();
    const sortedTypes = Object.keys(typeStats).sort((a, b) => {
        const indexA = orderedTypes.indexOf(a);
        const indexB = orderedTypes.indexOf(b);

        // If both defined, sort by index
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;

        // If one undefined, put it last
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;

        // If both undefined, sort alphabetical
        return a.localeCompare(b);
    });

    // Helper
    const getPct = (val, total) => total > 0 ? (val / total) * 100 : 0;

    return (
        <aside
            className={`sidebar-area ${isCollapsed ? 'collapsed' : ''}`}
            style={{
                position: 'relative',
                overflow: 'visible', // CRITICAL: Allows button to float outside + NO root scrollbar
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                borderRight: 'none' // We draw our own divider
            }}
        >
            {/* Visual Divider Line (Right Edge) */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    right: 0,
                    width: '1px',
                    background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.15) 10%, rgba(255,255,255,0.15) 90%, transparent)',
                    zIndex: 10
                }}
            />

            {/* Toggle Button (Visible ONLY when Expanded) */}
            <button
                onClick={(e) => { e.stopPropagation(); setIsCollapsed(!isCollapsed); }}
                className="glass-panel"
                title="Collapse"
                style={{
                    position: 'absolute',
                    top: '50%',
                    right: '-10px', // Pull out by half width (20px/2) to sit on line
                    transform: 'translateY(-50%)',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    padding: 0,
                    display: isCollapsed ? 'none' : 'flex', // Hide when collapsed
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '0.6rem',
                    color: 'var(--text-secondary)',
                    background: 'var(--bg-deep)', // Match bg to cover line behind it
                    border: '1px solid var(--glass-border)',
                    zIndex: 20,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
            >
                ◀
            </button>

            {/* Collapsed Content (Click to Open) */}
            <div
                onClick={() => setIsCollapsed(false)}
                title="Click to Expand"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: isCollapsed ? 1 : 0,
                    pointerEvents: isCollapsed ? 'auto' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'opacity 0.2s',
                    zIndex: 5
                }}
            >
                {/* Thin Bordered Progress Bar */}
                <div style={{
                    width: '14px',
                    height: '85%', // INCREASED HEIGHT
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    padding: '3px',
                    display: 'flex',
                    flexDirection: 'column-reverse',
                    background: 'rgba(0,0,0,0.2)'
                }}>
                    <div style={{ flex: 1, borderRadius: '4px', overflow: 'hidden', display: 'flex', flexDirection: 'column-reverse', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ height: `${getPct(fullyRemodeledCount, totalShips)}%`, background: 'var(--accent-gold)', width: '100%', transition: 'height 0.5s ease' }} />
                        <div style={{ height: `${getPct(acquiredCount - fullyRemodeledCount, totalShips)}%`, background: 'var(--accent-primary)', width: '100%', transition: 'height 0.5s ease' }} />
                    </div>
                </div>

                {/* Horizontal Percentage Text - UPDATED */}
                <div style={{
                    marginTop: '8px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    color: 'var(--text-secondary)',
                    textAlign: 'center'
                }}>
                    {Math.round(getPct(acquiredCount, totalShips))}%
                </div>
            </div>

            {/* Main Content (Scrollable Inner Container) */}
            <div
                className="sidebar-scroll-container"
                style={{
                    opacity: isCollapsed ? 0 : 1,
                    transition: 'opacity 0.2s',
                    pointerEvents: isCollapsed ? 'none' : 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-4)',
                    height: '100%',
                    overflowY: 'auto', // Scroll happens HERE
                    paddingRight: '12px',
                    maskImage: 'linear-gradient(to bottom, black 95%, transparent 100%)'
                }}
            >
                {/* Force Hide Scrollbars for this specific container */}
                <style>{`
                    .sidebar-scroll-container::-webkit-scrollbar { display: none; }
                    .sidebar-scroll-container { -ms-overflow-style: none; scrollbar-width: none; }
                `}</style>

                {/* Total Progress Card */}
                <div className="glass-panel card-content">
                    <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                        <h3 className="text-md font-bold text-pri" style={{ whiteSpace: 'nowrap' }}>Collection</h3>

                        {/* Action Buttons (Load/Save) */}
                        <div className="flex-row" style={{ gap: '4px' }}>
                            <label
                                className="btn-icon"
                                style={{ width: '24px', height: '24px', fontSize: '0.8rem' }}
                                title="Import Data"
                            >
                                ⬆
                                <input type="file" accept=".json" onChange={onImport} style={{ display: 'none' }} />
                            </label>
                            <button
                                className="btn-icon"
                                onClick={onExport}
                                style={{ width: '24px', height: '24px', fontSize: '0.8rem' }}
                                title="Export Data"
                            >
                                ⬇
                            </button>
                        </div>
                    </div>

                    <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span className="text-xs text-sec">
                            {acquiredCount} / {totalShips} <span style={{ color: 'var(--accent-gold)' }}>({fullyRemodeledCount}★)</span>
                        </span>
                        <span className="text-xs text-pri font-bold">{Math.round(getPct(acquiredCount, totalShips))}%</span>
                    </div>

                    <div style={{ position: 'relative', height: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden', display: 'flex' }}>
                        <div style={{ width: `${getPct(fullyRemodeledCount, totalShips)}%`, background: 'var(--accent-gold)', height: '100%', transition: 'width 0.5s ease' }} />
                        <div style={{ width: `${getPct(acquiredCount - fullyRemodeledCount, totalShips)}%`, background: 'var(--accent-primary)', height: '100%', transition: 'width 0.5s ease' }} />
                    </div>
                </div>

                {/* Resources Card */}
                <div className="glass-panel card-content">
                    <h3 className="text-md font-bold text-pri mb-2">Needed Resources</h3>
                    {Object.keys(totalNeeded).length === 0 ? (
                        <div className="text-sm text-sec" style={{ fontStyle: 'italic' }}>None! Great job.</div>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {Object.entries(totalNeeded).map(([res, count]) => {
                                const total = totalPossible[res] || count;
                                return (
                                    <li key={res} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'baseline',
                                        borderBottom: '1px dashed rgba(255,255,255,0.05)',
                                        paddingBottom: '2px'
                                    }}>
                                        <span className="text-xs text-sec">{res}</span>
                                        <div style={{ textAlign: 'right' }}>
                                            <span className="text-sm font-bold text-pri" style={{ marginRight: '2px' }}>{count}</span>
                                            <span className="text-xs text-tertiary">/ {total}</span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* Type Stats Card */}
                <div className="glass-panel card-content">
                    <h3 className="text-md font-bold text-pri mb-2">By Type</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {sortedTypes.map(type => {
                            const stats = typeStats[type];
                            const remodeledPct = getPct(stats.remodeled, stats.total);
                            const acquiredOnlyPct = getPct(stats.acquired - stats.remodeled, stats.total);

                            return (
                                <div key={type}>
                                    <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span className="text-xs font-medium">{shipTypeAliases[type] || type}</span>
                                        <span className="text-xs text-sec">
                                            {stats.acquired}/{stats.total} <span style={{ color: 'var(--accent-gold)' }}>({stats.remodeled}★)</span>
                                        </span>
                                    </div>
                                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden', display: 'flex' }}>
                                        <div style={{ width: `${remodeledPct}%`, background: 'var(--accent-gold)', height: '100%' }} />
                                        <div style={{ width: `${acquiredOnlyPct}%`, background: 'var(--accent-primary)', height: '100%' }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

        </aside >
    );
};

export default Sidebar;
