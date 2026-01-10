import React from 'react';

const Header = ({
    types,
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

    const toggleType = (type) => {
        const newParams = new Set(selectedTypes);
        if (newParams.has(type)) {
            newParams.delete(type);
        } else {
            newParams.add(type);
        }
        setSelectedTypes(newParams);
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
        <div className="flex-col" style={{ gap: 'var(--space-3)' }}>
            {/* Row 1: Search + Filters */}
            <div className="flex-row" style={{ gap: 'var(--space-4)' }}>
                <input
                    type="text"
                    className="input-glass"
                    placeholder="Search ship name, type, class..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ flex: 1, width: 'auto' }}
                />

                {/* Filter Icons Group */}
                <div className="flex-row" style={{ gap: 'var(--space-4)' }}>
                    {/* Status Group */}
                    <div className="flex-row" style={{ paddingRight: 'var(--space-4)', borderRight: '1px solid var(--glass-border)' }}>
                        <button
                            className={`btn-icon ${filterStatuses.has('unacquired') ? 'active-blue' : ''}`}
                            onClick={() => toggleStatus('unacquired')}
                            title="Unacquired"
                            style={{ opacity: filterStatuses.size > 0 && !filterStatuses.has('unacquired') ? 0.3 : 1 }}
                        >
                            ⚓
                        </button>
                        <button
                            className={`btn-icon ${filterStatuses.has('remodeling') ? 'active-blue' : ''}`}
                            onClick={() => toggleStatus('remodeling')}
                            title="Remodeling"
                            style={{ opacity: filterStatuses.size > 0 && !filterStatuses.has('remodeling') ? 0.3 : 1 }}
                        >
                            🛠️
                        </button>
                        <button
                            className={`btn-icon ${filterStatuses.has('complete') ? 'active-green' : ''}`}
                            onClick={() => toggleStatus('complete')}
                            title="Complete"
                            style={{ opacity: filterStatuses.size > 0 && !filterStatuses.has('complete') ? 0.3 : 1 }}
                        >
                            ✅
                        </button>
                    </div>

                    {/* Properties Group */}
                    <div className="flex-row">
                        <button
                            className={`btn-icon ${filterPriority ? 'active-gold' : ''}`}
                            onClick={() => setFilterPriority(!filterPriority)}
                            title="Priority"
                            style={{ opacity: filterPriority ? 1 : 0.5 }}
                        >
                            ★
                        </button>
                        <button
                            className={`btn-icon ${filterTask ? 'active-red' : ''}`}
                            onClick={() => setFilterTask(!filterTask)}
                            title="Task"
                            style={{ opacity: filterTask ? 1 : 0.5 }}
                        >
                            !
                        </button>
                    </div>
                </div>
            </div>

            {/* Row 2: Types Scrollable */}
            <div className="flex-row" style={{ overflowX: 'auto', paddingBottom: '4px', gap: 'var(--space-2)' }}>
                {types.map(type => (
                    <button
                        key={type}
                        onClick={() => toggleType(type)}
                        className={`filter-btn ${selectedTypes.has(type) ? 'active' : ''}`}
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        {type}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Header;
