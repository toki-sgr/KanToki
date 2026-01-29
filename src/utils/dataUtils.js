import rawShipsData from '../data/ships.json';
import { toRomaji } from 'wanakana';




// Helper to add Romaji to ship data
export const enrichShipData = (ships) => {
    return ships.map(ship => ({
        ...ship,
        romaji: ship.hiragana ? toRomaji(ship.hiragana) : ''
    }));
};

// Pre-calculate Romaji for performance (using the helper)
const shipsWithRomaji = enrichShipData(rawShipsData);

export const getAllShips = () => {
    return shipsWithRomaji;
};

export const getAllShipTypes = () => {
    const types = new Set();
    rawShipsData.forEach(ship => {
        types.add(ship.type);
        // Include remodeling types
        ship.stages.forEach(stage => {
            if (stage.type) types.add(stage.type);
        });
    });
    return Array.from(types).sort();
};

export const calculateNeededResources = (ship, currentStageIndex, acquired) => {
    // Calculate resource needs based on acquisition status
    let needed = {};

    const startStage = acquired ? currentStageIndex + 1 : 0;

    for (let i = startStage; i < ship.stages.length; i++) {
        const stage = ship.stages[i];
        const res = stage.resources;

        // Normalize resources
        if (Array.isArray(res)) {
            // empty array, no resources
            continue;
        } else if (typeof res === 'object') {
            Object.entries(res).forEach(([key, value]) => {
                needed[key] = (needed[key] || 0) + value;
            });
        }
    }

    return needed;
};

export const calculateTotalResources = (ship) => {
    let total = {};
    ship.stages.forEach(stage => {
        const res = stage.resources;
        if (typeof res === 'object' && !Array.isArray(res)) {
            Object.entries(res).forEach(([key, value]) => {
                total[key] = (total[key] || 0) + value;
            });
        }
    });
    return total;
};

export const getShipStatus = (ship, userState) => {
    // 'unacquired' | 'remodeling' | 'complete'
    if (!userState.acquired) return 'unacquired';

    // Check if all stages are done
    // Logic: last stage checked = complete
    const stages = userState.stages || {};
    const lastStageIndex = ship.stages.length - 1;

    if (stages[lastStageIndex]) return 'complete';

    return 'remodeling';
};

export const matchesSearch = (ship, query) => {
    if (!query) return true;
    const q = query.toLowerCase();

    // Name, Hiragana, Romaji, Class, Type
    if (ship.name.toLowerCase().includes(q)) return true;
    if (ship.hiragana?.includes(q)) return true;
    if (ship.class.toLowerCase().includes(q)) return true;
    if (ship.type.toLowerCase().includes(q)) return true;

    // Check stage details
    const stageMatch = ship.stages.some(s =>
        s.name.toLowerCase().includes(q) ||
        s.type?.toLowerCase().includes(q)
    );

    return stageMatch;
};
