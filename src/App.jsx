import { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ShipCard from './components/ShipCard';
import JsonEditorModal from './components/JsonEditorModal';
import { getAllShips, getAllShipTypes, getShipStatus, matchesSearch } from './utils/dataUtils';
import { shipTemplate } from './data/shipsTemplate';

function App() {
  const [ships, setShips] = useState([]);
  const [availableTypes, setAvailableTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState(new Set());

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatuses, setFilterStatuses] = useState(new Set());
  const [filterPriority, setFilterPriority] = useState(false);
  const [filterTask, setFilterTask] = useState(false);

  // Editor State
  const [editorState, setEditorState] = useState({
    isOpen: false,
    mode: 'add', // 'add' or 'edit'
    data: null,
    targetName: null // use name as ID for editing
  });

  // User State: { shipName: { acquired: bool, priority: bool, task: bool, stages: { 0: bool, 1: bool } } }
  const [userState, setUserState] = useState(() => {
    const saved = localStorage.getItem('kantoki_user_state');
    return saved ? JSON.parse(saved) : {};
  });

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
          // Fallback to imported data if API fails (e.g. static build)
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

  // Persist user state locally
  useEffect(() => {
    localStorage.setItem('kantoki_user_state', JSON.stringify(userState));
  }, [userState]);

  // ships persistence handled via API calls in add/edit handlers, not useEffect


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

  const updateUserState = (shipName, newState) => {
    setUserState(prev => ({
      ...prev,
      [shipName]: newState
    }));
  };

  // Editor Handlers
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

    // Optimistic Update
    setShips(newShips);
    refreshTypes(newShips);

    // Save to disk
    try {
      const res = await fetch('/api/ships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newShips)
      });
      if (!res.ok) {
        alert("Failed to save changes to disk!");
        console.error("Save failed");
      }
    } catch (e) {
      console.error("Error saving ships:", e);
      alert("Error preventing save!");
    }
  };

  const handleDeleteShip = async () => {
    if (editorState.mode === 'edit' && editorState.targetName) {
      if (!window.confirm(`Are you sure you want to delete ${editorState.targetName}?`)) return;

      const newShips = ships.filter(s => s.name !== editorState.targetName);

      // Optimistic Update
      setShips(newShips);
      refreshTypes(newShips);

      // Save to disk
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
      // Sort by Type first, then by Class (Numeric)
      const collator = new Intl.Collator('ja', { numeric: true });
      const typeDiff = collator.compare(a.type, b.type);
      if (typeDiff !== 0) return typeDiff;
      return collator.compare(a.class, b.class);
    });
  }, [ships, selectedTypes, filterStatuses, filterPriority, filterTask, searchQuery, userState]);



  const handleExportUserState = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userState, null, 4));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "kantoki_userdata.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
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
    // Reset value so same file can be selected again
    event.target.value = '';
  };

  return (
    <div className="app-container">
      <div className="sticky-header">
        <div className="header-row">
          <h1 className="app-brand">KanToki</h1>
          <div className="flex-row">
            {/* Data Management Group */}
            <div className="flex-row">
              {/* Import User Data */}
              <label
                className="btn-icon"
                style={{ width: 'auto', padding: '0 12px', gap: '8px', fontSize: '0.85rem' }}
                title="Import User Progress"
              >
                <span>⬆ Load</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportUserState}
                  style={{ display: 'none' }}
                />
              </label>

              {/* Export User Data */}
              <button
                onClick={handleExportUserState}
                className="btn-icon"
                style={{ width: 'auto', padding: '0 12px', gap: '8px', fontSize: '0.85rem' }}
                title="Export User Progress (Backup)"
              >
                ⬇ Save
              </button>
            </div>


          </div>
        </div>
        <Header
          types={availableTypes}
          selectedTypes={selectedTypes}
          setSelectedTypes={setSelectedTypes}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterStatuses={filterStatuses}
          setFilterStatuses={setFilterStatuses}
          filterPriority={filterPriority}
          setFilterPriority={setFilterPriority}
          filterTask={filterTask}
          setFilterTask={setFilterTask}
        />
      </div>


      <div className="main-layout">
        <Sidebar
          ships={ships}
          filteredShips={filteredShips}
          userState={userState}
        />

        <main className="content-area">
          <div className="grid-ships">
            {filteredShips.map(ship => (
              <ShipCard
                key={ship.name}
                ship={ship}
                userState={userState[ship.name] || {}}
                onUpdate={(newState) => updateUserState(ship.name, newState)}
                onEdit={() => handleEditShip(ship)}
              />
            ))}

            {/* Add New Ship Card - Appended to grid */}
            <button
              onClick={handleAddShip}
              className="glass-panel ship-card flex-center"
              style={{
                minHeight: '220px',
                border: '2px dashed var(--glass-border)',
                background: 'rgba(255,255,255,0.02)',
                cursor: 'pointer',
                flexDirection: 'column',
                gap: 'var(--space-2)',
                color: 'var(--text-secondary)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.color = 'var(--accent-primary)';
                e.currentTarget.style.background = 'rgba(56, 189, 248, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--glass-border)';
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
              }}
            >
              <div style={{ fontSize: '2.5rem', fontWeight: '300', lineHeight: 1 }}>+</div>
              <span className="text-sm font-medium">Add New Ship</span>
            </button>
            {filteredShips.length === 0 && (
              <div className="no-results" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                No ships found matching criteria.
              </div>
            )}
          </div>
        </main>
      </div>

      <JsonEditorModal
        isOpen={editorState.isOpen}
        onClose={() => setEditorState(prev => ({ ...prev, isOpen: false }))}
        onSave={handleSaveShip}
        onDelete={editorState.mode === 'edit' ? handleDeleteShip : undefined}
        initialData={editorState.data}
        title={editorState.mode === 'add' ? 'Add New Ship' : `Edit ${editorState.targetName}`}
      />
    </div >
  );
}

export default App;
