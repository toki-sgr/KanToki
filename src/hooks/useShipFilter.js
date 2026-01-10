import { useState, useMemo } from 'react';
import { getShipStatus, matchesSearch } from '../utils/dataUtils';
import { getAllOrderedTypes } from '../data/shipTypeMappings';

export const useShipFilter = (ships, userState) => {
    // Filter States
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTypes, setSelectedTypes] = useState(new Set());
    const [filterStatuses, setFilterStatuses] = useState(new Set());
    const [filterPriority, setFilterPriority] = useState(false);
    const [filterTask, setFilterTask] = useState(false);

    const filteredShips = useMemo(() => {
        return ships.filter(ship => {
            const uState = userState[ship.name] || {};
            const status = getShipStatus(ship, uState);

            const typeMatch = selectedTypes.size === 0 ||
                selectedTypes.has(ship.type) ||
                ship.stages.some(s => selectedTypes.has(s.type));

            const statusMatch = filterStatuses.size === 0 || filterStatuses.has(status);

            const priorityMatch = !filterPriority || uState.priority;
            const taskMatch = !filterTask || uState.task;

            const searchMatch = matchesSearch(ship, searchQuery);

            return typeMatch && statusMatch && priorityMatch && taskMatch && searchMatch;
        }).sort((a, b) => {
            // Sort by Type first (Mapped Order), then by Class (Numeric)
            const orderedTypes = getAllOrderedTypes();

            const typeIndexA = orderedTypes.indexOf(a.type);
            const typeIndexB = orderedTypes.indexOf(b.type);

            // 1. By Type Order (Defined first)
            if (typeIndexA !== -1 && typeIndexB !== -1) {
                if (typeIndexA !== typeIndexB) return typeIndexA - typeIndexB;
            } else if (typeIndexA !== -1) {
                return -1; // A is defined, B is not -> A comes first
            } else if (typeIndexB !== -1) {
                return 1; // B is defined, A is not -> B comes first
            } else {
                // Both undefined, fall back to locale compare
                const typeDiff = a.type.localeCompare(b.type);
                if (typeDiff !== 0) return typeDiff;
            }

            // 2. By Class
            const collator = new Intl.Collator('ja', { numeric: true });
            return collator.compare(a.class, b.class);
        });
    }, [ships, selectedTypes, filterStatuses, filterPriority, filterTask, searchQuery, userState]);

    return {
        // State
        searchQuery, setSearchQuery,
        selectedTypes, setSelectedTypes,
        filterStatuses, setFilterStatuses,
        filterPriority, setFilterPriority,
        filterTask, setFilterTask,
        // Result
        filteredShips
    };
};
