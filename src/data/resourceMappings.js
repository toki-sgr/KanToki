/**
 * Mapping of full resource names to their abbreviated forms.
 * Used in ShipCard to save space.
 */
export const resourceMappings = {
    "改装設計図": "図",
    "海外艦最新技術": "海",
    "高速建造材": "バ",
    "開発資材": "釘",
    "新型砲熕兵装資材": "砲",
    "戦闘詳報": "報",
    "新型高温高圧缶": "缶",
    "新型兵装資材": "兵",
    "試製甲板カタパルト": "甲",
    "新型航空兵装資材": "航",
};

/**
 * Helper to get the abbreviated name.
 * Returns the short name if found, otherwise returns the original name.
 */
export const getResourceName = (fullName) => {
    return resourceMappings[fullName] || fullName;
};
