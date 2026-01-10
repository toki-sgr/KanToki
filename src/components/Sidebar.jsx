import React from 'react';
import { calculateNeededResources, calculateTotalResources } from '../utils/dataUtils';

const Sidebar = ({ ships, userState }) => {

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

    // Sort types
    const sortedTypes = Object.keys(typeStats).sort();

    // Helper
    const getPct = (val, total) => total > 0 ? (val / total) * 100 : 0;

    return (
        <aside className="sidebar-area">

            {/* Total Progress Card */}
            <div className="glass-panel card-content">
                <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                    <h3 className="text-md font-bold text-pri" style={{ whiteSpace: 'nowrap' }}>Collection Progress</h3>
                    <span className="text-xs text-sec" style={{ whiteSpace: 'nowrap' }}>
                        {acquiredCount} / {totalShips} <span style={{ color: 'var(--accent-gold)' }}>({fullyRemodeledCount}★)</span>
                    </span>
                </div>

                <div style={{ position: 'relative', height: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${getPct(fullyRemodeledCount, totalShips)}%`, background: 'var(--accent-gold)', height: '100%', transition: 'width 0.5s ease' }} />
                    <div style={{ width: `${getPct(acquiredCount - fullyRemodeledCount, totalShips)}%`, background: 'var(--accent-primary)', height: '100%', transition: 'width 0.5s ease' }} />

                    {/* Centered Percentage Text */}
                    <div className="flex-center" style={{
                        position: 'absolute',
                        inset: 0,
                        fontSize: '10px',
                        fontWeight: 'bold',
                        color: '#fff',
                        textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                    }}>
                        {Math.round(getPct(acquiredCount, totalShips))}%
                    </div>
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
                <h3 className="text-md font-bold text-pri mb-2">By Class</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {sortedTypes.map(type => {
                        const stats = typeStats[type];
                        const remodeledPct = getPct(stats.remodeled, stats.total);
                        const acquiredOnlyPct = getPct(stats.acquired - stats.remodeled, stats.total);

                        return (
                            <div key={type}>
                                <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span className="text-xs font-medium">{type}</span>
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

        </aside >
    );
};

export default Sidebar;
