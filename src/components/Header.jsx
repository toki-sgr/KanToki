import React, { useMemo } from 'react';
import { shipTypeGroups, shipTypeAliases } from '../data/shipTypeMappings';

// SVG Icons
const SearchIcon = () => (
    <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const XIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const AnchorIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="3"></circle>
        <line x1="12" y1="22" x2="12" y2="8"></line>
        <path d="M5 12H2a10 10 0 0 0 20 0h-3"></path>
    </svg>
);

const HammerIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
    </svg>
);

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const Header = ({
    availableTypes = [],
    selectedTypes,
    setSelectedTypes,
    searchQuery,
    setSearchQuery,
    filterStatuses,
    setFilterStatuses,
    filterPriority,
    setFilterPriority,
    filterTask,
    setFilterTask
}) => {

    // Compute display groups including "Others" if needed
    const displayGroups = useMemo(() => {
        if (!shipTypeGroups) return [];

        const definedTypes = new Set(shipTypeGroups.flatMap(g => g.subTypes || []));
        const safeAvailableTypes = Array.isArray(availableTypes) ? availableTypes : [];
        const otherTypes = safeAvailableTypes
            .filter(t => t && !definedTypes.has(t))
            .sort();

        if (otherTypes.length === 0) return shipTypeGroups;

        return [
            ...shipTypeGroups,
            {
                id: "OTH",
                label: "Others",
                subTypes: otherTypes
            }
        ];
    }, [availableTypes]);

    // Toggle a specific sub-type (Level 2)
    const toggleType = (type) => {
        const newParams = new Set(selectedTypes);
        if (newParams.has(type)) {
            newParams.delete(type);
        } else {
            newParams.add(type);
        }
        setSelectedTypes(newParams);
    };

    // Toggle a Major Category (Level 1)
    const toggleGroup = (group) => {
        const newParams = new Set(selectedTypes);
        const allSubTypes = group.subTypes;

        // Check if all are currently selected
        const allSelected = allSubTypes.every(t => newParams.has(t));

        if (allSelected) {
            allSubTypes.forEach(t => newParams.delete(t));
        } else {
            allSubTypes.forEach(t => newParams.add(t));
        }
        setSelectedTypes(newParams);
    };

    // Helper: Determine if a group is fully or partially selected
    const getGroupStatus = (group) => {
        const allSubTypes = group.subTypes;
        const selectedCount = allSubTypes.filter(t => selectedTypes.has(t)).length;

        if (selectedCount === allSubTypes.length) return 'full';
        if (selectedCount > 0) return 'partial';
        return 'none';
    };

    // State for per-category hover
    const [hoveredGroup, setHoveredGroup] = React.useState(null);
    const timeoutRef = React.useRef(null);
    const headerRef = React.useRef(null);

    // Handlers
    const handleGroupEnter = (group) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setHoveredGroup(group);
    };

    const handleGroupLeave = () => {
        // 1s grace period to move to popup
        timeoutRef.current = setTimeout(() => {
            setHoveredGroup(null);
        }, 1000);
    };

    const handleDropdownEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    const handleDropdownLeave = () => {
        // Close immediately when leaving the popup
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setHoveredGroup(null);
    };

    const toggleStatus = (status) => {
        const newStatuses = new Set(filterStatuses);
        if (newStatuses.has(status)) {
            newStatuses.delete(status);
        } else {
            newStatuses.add(status);
        }
        setFilterStatuses(newStatuses);
    };

    return (
        <div
            ref={headerRef}
            className="flex-col"
            style={{ gap: 'var(--space-4)', padding: '4px 0', position: 'relative' }}
        >
            {/* Row 1: Search + Icon Filters */}
            <div className="flex-row" style={{ gap: 'var(--space-4)', flexWrap: 'nowrap', alignItems: 'center' }}>

                {/* Search Bar Refined */}
                <div className="search-wrapper">
                    <SearchIcon />
                    <input
                        type="text"
                        className="input-glass-search"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            className="search-clear"
                            onClick={() => setSearchQuery('')}
                            title="Clear search"
                        >
                            <XIcon />
                        </button>
                    )}
                </div>

                {/* Filter Icons Group */}
                <div className="flex-row" style={{ gap: 'var(--space-2)' }}>
                    {/* Status Group */}
                    <div className="glass-panel flex-row" style={{ padding: '4px', gap: '4px', borderRadius: '8px' }}>
                        <button
                            className={`btn-icon ${filterStatuses.has('unacquired') ? 'active-blue' : ''}`}
                            onClick={() => toggleStatus('unacquired')}
                            title="Unacquired"
                            style={{ width: '32px', height: '32px', opacity: filterStatuses.size > 0 && !filterStatuses.has('unacquired') ? 0.4 : 1 }}
                        >
                            <AnchorIcon />
                        </button>
                        <button
                            className={`btn-icon ${filterStatuses.has('remodeling') ? 'active-blue' : ''}`}
                            onClick={() => toggleStatus('remodeling')}
                            title="Remodeling"
                            style={{ width: '32px', height: '32px', opacity: filterStatuses.size > 0 && !filterStatuses.has('remodeling') ? 0.4 : 1 }}
                        >
                            <HammerIcon />
                        </button>
                        <button
                            className={`btn-icon ${filterStatuses.has('complete') ? 'active-green' : ''}`}
                            onClick={() => toggleStatus('complete')}
                            title="Complete"
                            style={{ width: '32px', height: '32px', opacity: filterStatuses.size > 0 && !filterStatuses.has('complete') ? 0.4 : 1 }}
                        >
                            <CheckIcon />
                        </button>
                    </div>

                    {/* Properties Group */}
                    <div className="glass-panel flex-row" style={{ padding: '4px', gap: '4px', borderRadius: '8px' }}>
                        <button
                            className={`btn-icon ${filterPriority ? 'active-gold' : ''}`}
                            onClick={() => setFilterPriority(!filterPriority)}
                            title="Priority"
                            style={{ width: '32px', height: '32px', opacity: filterPriority ? 1 : 0.4 }}
                        >
                            ★
                        </button>
                        <button
                            className={`btn-icon ${filterTask ? 'active-red' : ''}`}
                            onClick={() => setFilterTask(!filterTask)}
                            title="Task"
                            style={{ width: '32px', height: '32px', opacity: filterTask ? 1 : 0.4 }}
                        >
                            !
                        </button>
                    </div>
                </div>
            </div>

            {/* Row 2: Category Pills */}
            <div className="flex-row" style={{ gap: '8px', overflowX: 'auto', maxWidth: '100%', paddingBottom: '4px', scrollbarWidth: 'none' }}>
                {displayGroups.map(group => {
                    const status = getGroupStatus(group);
                    const isHovered = hoveredGroup?.id === group.id;
                    return (
                        <button
                            key={group.id}
                            onClick={() => toggleGroup(group)}
                            onMouseEnter={() => handleGroupEnter(group)}
                            onMouseLeave={handleGroupLeave}
                            className={`filter-pill ${status === 'full' ? 'active' : ''} ${status === 'partial' ? 'partial' : ''}`}
                            style={{
                                // Minimal visual feedback for hover state
                                boxShadow: isHovered ? '0 4px 12px rgba(56,189,248,0.2)' : 'none'
                            }}
                        >
                            {group.label}
                        </button>
                    );
                })}
            </div>

            {/* Row 3: Sub Types Detail View (Floating - Contextual) */}
            <div
                className={`dropdown-wrapper ${hoveredGroup ? 'open' : ''}`}
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleDropdownLeave}
                style={{
                    pointerEvents: hoveredGroup ? 'auto' : 'none', // Ensure clicks work
                }}
            >
                <div className="dropdown-inner">
                    <div className="glass-panel" style={{
                        padding: 'var(--space-4)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-3)',
                        marginTop: '4px',
                        background: 'rgba(15, 16, 20, 0.95)',
                        border: '1px solid var(--glass-border-light)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                    }}>
                        {hoveredGroup && (
                            <div className="flex-row" style={{ alignItems: 'center', gap: 'var(--space-4)' }}>
                                {/* Group Label */}
                                <div style={{ width: '60px', fontSize: '0.75rem', fontWeight: 'bold', opacity: 0.5, textAlign: 'right' }}>
                                    {hoveredGroup.id}
                                </div>

                                {/* Sub-type Buttons */}
                                <div className="flex-row" style={{ flexWrap: 'wrap', gap: '6px', flex: 1 }}>
                                    {hoveredGroup.subTypes.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => toggleType(type)}
                                            className={`filter-pill ${selectedTypes.has(type) ? 'active' : ''}`}
                                            style={{ fontSize: '0.75rem', padding: '2px 10px', height: 'auto' }}
                                        >
                                            {shipTypeAliases[type] || type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
