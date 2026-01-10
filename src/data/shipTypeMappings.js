/**
 * Defines the hierarchy and aliases for ship types.
 * Used for the advanced 2-level filtering system.
 * 
 * Source of Truth: shipTypeDefinitions
 */

export const shipTypeDefinitions = [
    {
        id: "BB",
        label: "戦艦級",
        displayLabel: "戦艦級",
        subTypes: {
            "戦艦": "戦艦 (BB)",
            "高速戦艦": "高速戦艦 (FBB)",
            "巡洋戦艦": "巡洋戦艦 (BC)",
            "航空戦艦": "航空戦艦 (BBV)",
            "改装航空戦艦": "改装航空戦艦 (BBV)"
        }
    },
    {
        id: "CV",
        label: "航空母艦級",
        displayLabel: "航空母艦級",
        subTypes: {
            "正規空母": "正規空母 (CV)",
            "装甲空母": "装甲空母 (CVB)",
            "夜間作戦航空母艦": "夜間作戦空母 (CV)",
            "近代化航空母艦": "近代化空母 (CV)",
            "航空母艦": "航空母艦 (CV)",
            "軽空母": "軽空母 (CVL)",
            "特設護衛空母": "護衛空母 (CVE)",
            "戦力投射母艦": "戦力投射母艦 (CVL)"
        }
    },
    {
        id: "CA",
        label: "重巡級",
        displayLabel: "重巡級",
        subTypes: {
            "重巡洋艦": "重巡洋艦 (CA)",
            "航空巡洋艦": "航空巡洋艦 (CAV)",
            "改装航空巡洋艦": "改装航巡 (CAV)",
            "特殊改装航空巡洋艦": "特殊改装航巡 (CAV)"
        }
    },
    {
        id: "CL",
        label: "軽巡級",
        displayLabel: "軽巡級",
        subTypes: {
            "軽巡洋艦": "軽巡洋艦 (CL)",
            "重雷装巡洋艦": "雷巡 (CLT)",
            "練習巡洋艦": "練巡 (CT)",
            "兵装実験軽巡": "兵装実験軽巡 (CL)",
            "重改装軽巡洋艦": "重改装軽巡 (CL)",
            "軽(航空)巡洋艦": "軽空巡 (CLV)"
        }
    },
    {
        id: "DD",
        label: "駆逐艦",
        displayLabel: "駆逐艦",
        subTypes: {
            "駆逐艦": "駆逐艦 (DD)"
        }
    },
    {
        id: "DE",
        label: "海防艦",
        displayLabel: "海防艦",
        subTypes: {
            "海防艦": "海防艦 (DE)",
            "海防戦艦": "海防戦艦"
        }
    },
    {
        id: "SS",
        label: "潜水艦",
        displayLabel: "潜水艦",
        subTypes: {
            "潜水艦": "潜水艦 (SS)",
            "潜水空母": "潜水空母 (SSV)"
        }
    },
    {
        id: "AUX",
        label: "補助艦艇",
        displayLabel: "補助艦艇",
        subTypes: {
            "水上機母艦": "水母 (AV)",
            "特設戦闘水上機母艦": "特設水母 (AV)",
            "潜水母艦": "潜水母艦 (AS)",
            "工作艦": "工作艦 (AR)",
            "補給艦": "補給艦 (AO)",
            "給糧艦": "給糧艦",
            "揚陸艦": "揚陸艦 (LHA)",
            "戦車揚陸艦": "戦車揚陸艦 (LST)",
            "特務艦": "特務艦",
            "練習特務艦": "練習特務艦",
            "灯台補給船": "灯台補給船",
            "砕氷艦": "砕氷艦",
            "南極観測船": "南極観測船",
            "雑役船": "雑役船"
        }
    }
];

// --- Derived Exports for Backward Compatibility ---

// 1. Groups Array for UI iteration: [{ id, label, subTypes: ["Type1", "Type2"] }]
export const shipTypeGroups = shipTypeDefinitions.map(def => ({
    id: def.id,
    label: def.displayLabel || def.label, // Use styled label by default
    subTypes: Object.keys(def.subTypes)
}));

// 2. Flat Alias Map: { "Type": "Alias" }
export const shipTypeAliases = shipTypeDefinitions.reduce((acc, def) => {
    return { ...acc, ...def.subTypes };
}, {});

/**
 * Helper to get all subgroups as a flat set for verification or default states.
 */
/**
 * Helper to get all defined types in the order they appear in the definitions.
 * Using a Set to ensure Uniqueness is not strictly necessary if definitions are clean,
 * but good for safety.
 * Returns: ["BB", "FBB", "BC", ..., "DD", ...]
 */
export const getAllOrderedTypes = () => {
    return shipTypeDefinitions.flatMap(g => Object.keys(g.subTypes));
};
