import { useState, useEffect, useMemo } from 'react';
import { getAllShips } from '../utils/dataUtils';
import { shipTemplate } from '../data/shipsTemplate';

export const useShipData = (userState, setUserState) => {
    const [ships, setShips] = useState([]);
    const [availableTypes, setAvailableTypes] = useState([]);

    // Editor State
    const [editorState, setEditorState] = useState({
        isOpen: false,
        mode: 'add',
        data: null,
        targetName: null
    });

    const refreshTypes = (data) => {
        const types = new Set();
        data.forEach(ship => {
            types.add(ship.type);
            ship.stages.forEach(stage => {
                if (stage.type) types.add(stage.type);
            });
        });
        setAvailableTypes(Array.from(types).sort());
    };

    // Load initial ship data
    useEffect(() => {
        const fetchShips = async () => {
            try {
                const response = await fetch('/api/ships');
                if (response.ok) {
                    const data = await response.json();
                    setShips(data);
                    refreshTypes(data);
                } else {
                    console.error("Failed to fetch ships API");
                    const fallback = getAllShips();
                    setShips(fallback);
                    refreshTypes(fallback);
                }
            } catch (err) {
                console.error("Error fetching ships:", err);
                const fallback = getAllShips();
                setShips(fallback);
                refreshTypes(fallback);
            }
        };

        fetchShips();
    }, []);

    // Derive all available types from data for "Others" detection
    const allShipTypes = useMemo(() => {
        const types = new Set();
        ships.forEach(ship => {
            if (ship.type) types.add(ship.type);
            if (ship.stages) {
                ship.stages.forEach(stage => {
                    if (stage.type) types.add(stage.type);
                });
            }
        });
        return Array.from(types);
    }, [ships]);


    // Handlers
    const handleAddShip = () => {
        setEditorState({
            isOpen: true,
            mode: 'add',
            data: shipTemplate,
            targetName: null
        });
    };

    const handleEditShip = (ship) => {
        setEditorState({
            isOpen: true,
            mode: 'edit',
            data: ship,
            targetName: ship.name
        });
    };

    const handleSaveShip = async (newShipData) => {
        let newShips;
        if (editorState.mode === 'add') {
            newShips = [...ships, newShipData];
        } else {
            newShips = ships.map(s => s.name === editorState.targetName ? newShipData : s);

            // Handle rename case for userState
            if (editorState.targetName !== newShipData.name) {
                const uState = userState[editorState.targetName];
                if (uState) {
                    setUserState(prev => {
                        const next = { ...prev };
                        delete next[editorState.targetName];
                        next[newShipData.name] = uState;
                        return next;
                    });
                }
            }
        }

        setShips(newShips);
        setEditorState(prev => ({ ...prev, isOpen: false }));

        try {
            const res = await fetch('/api/ships', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newShips)
            });
            if (!res.ok) console.error("Save failed");
        } catch (e) {
            console.error("Error saving ships:", e);
        }
    };

    const handleDeleteShip = async () => {
        if (editorState.mode === 'edit' && editorState.targetName) {
            if (!window.confirm(`Are you sure you want to delete ${editorState.targetName}?`)) return;

            const newShips = ships.filter(s => s.name !== editorState.targetName);
            setShips(newShips);
            setEditorState(prev => ({ ...prev, isOpen: false }));

            try {
                const res = await fetch('/api/ships', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newShips)
                });
                if (!res.ok) console.error("Delete persistence failed");
            } catch (e) {
                console.error("Error deleting ship:", e);
            }
        }
    };

    const closeEditor = () => setEditorState(prev => ({ ...prev, isOpen: false }));

    return {
        ships,
        availableTypes: allShipTypes, // Using derived memo 
        editorState,
        handleAddShip,
        handleEditShip,
        handleSaveShip,
        handleDeleteShip,
        closeEditor
    };
};
