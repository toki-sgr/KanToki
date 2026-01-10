/**
 * Template for creating new ship entries.
 * Used by the JsonEditorModal when adding a new ship.
 */
export const shipTemplate = {
    // Basic Information
    "name": "",          // e.g. "Bismarck"
    "hiragana": "",      // e.g. "びすまるく" (Used for sorting/search)
    "type": "駆逐艦",    // Default: Destroyer (DD)
    "class": "",         // e.g. "Bismarck-class 1st Ship"

    // Media & Links
    "imageUrl": "https://placehold.co/600x400/1e293b/475569?text=No+Image",
    "wikiUrl": "https://wikiwiki.jp/kancolle/",

    // Remodel Stages (Must include at least one stage)
    "stages": [
        // Stage 1 (Base/Kai)
        {
            "level": 1,
            "name": "Base", // e.g. "Bismarck" or "Bismarck Kai"
            "type": "駆逐艦", // Should match base type unless converted (e.g. CV -> CVB)
            "class": "",      // Should match base class unless changed

            // Resources needed to reach NEXT stage (if any)
            // Leave empty for the final stage.
            "resources": {
                // "Ammnunition": 100,
                // "Steel": 200,
                // "Blueprint": 1
            }
        }
    ]
};
