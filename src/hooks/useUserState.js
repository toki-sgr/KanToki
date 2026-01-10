import { useState, useEffect } from 'react';

export const useUserState = () => {
    // User State: { shipName: { acquired: bool, priority: bool, task: bool, stages: { 0: bool, 1: bool } } }
    const [userState, setUserState] = useState(() => {
        const saved = localStorage.getItem('kantoki_user_state');
        return saved ? JSON.parse(saved) : {};
    });

    // Persist user state locally
    useEffect(() => {
        localStorage.setItem('kantoki_user_state', JSON.stringify(userState));
    }, [userState]);

    const updateUserState = (shipName, newState) => {
        setUserState(prev => ({
            ...prev,
            [shipName]: newState
        }));
    };

    const handleImportUserState = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedState = JSON.parse(e.target.result);
                if (typeof importedState === 'object' && importedState !== null) {
                    setUserState(importedState);
                    alert('User data imported successfully!');
                } else {
                    alert('Invalid file format.');
                }
            } catch (err) {
                console.error('Error importing user data', err);
                alert('Failed to parse JSON file.');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const handleExportUserState = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userState, null, 4));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "kantoki_userdata.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return {
        userState,
        setUserState,
        updateUserState,
        handleImportUserState,
        handleExportUserState
    };
};
