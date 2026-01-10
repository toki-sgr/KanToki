import React from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ShipCard from './components/ShipCard';
import JsonEditorModal from './components/JsonEditorModal';
import SkeletonLoader from './components/SkeletonLoader';
import Banner from './components/Banner';
import { useUserState } from './hooks/useUserState';
import { useShipData } from './hooks/useShipData';
import { useShipFilter } from './hooks/useShipFilter';

function App() {
  // 1. User State (Persistence)
  const {
    userState,
    setUserState,
    updateUserState,
    handleImportUserState,
    handleExportUserState
  } = useUserState();

  // 2. Ship Data & Editor
  const {
    ships,
    availableTypes,
    editorState,
    handleAddShip,
    handleEditShip,
    handleSaveShip,
    handleDeleteShip,
    closeEditor
  } = useShipData(userState, setUserState);

  // 3. Filtering Logic
  const {
    searchQuery, setSearchQuery,
    selectedTypes, setSelectedTypes,
    filterStatuses, setFilterStatuses,
    filterPriority, setFilterPriority,
    filterTask, setFilterTask,
    filteredShips
  } = useShipFilter(ships, userState);

  // 4. Tab State
  const [activeTab, setActiveTab] = React.useState('ships');

  return (
    <div className="app-container">
      {/* Global Banner (Fixed Top) */}
      <Banner activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab: Ship Collection */}
      {activeTab === 'ships' && (
        <>
          <div className="sticky-header">
            <Header
              availableTypes={availableTypes}
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
              userState={userState}
              onImport={handleImportUserState}
              onExport={handleExportUserState}
            />

            <main className="content-area">
              <div className="grid-ships">
                {ships.length === 0 ? (
                  <SkeletonLoader count={8} />
                ) : (
                  <>
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

                    {filteredShips.length === 0 && ships.length > 0 && (
                      <div className="no-results" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                        No ships found matching criteria.
                      </div>
                    )}
                  </>
                )}
              </div>
            </main>
          </div>
        </>
      )}

      {/* Tab: Quests (Placeholder) */}
      {activeTab === 'quests' && (
        <div className="flex-center w-full" style={{ flex: 1, flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '3rem' }}>🚧</div>
          <h2 className="text-xl text-sec">Preparing...</h2>
        </div>
      )}

      <JsonEditorModal
        isOpen={editorState.isOpen}
        onClose={closeEditor}
        onSave={handleSaveShip}
        onDelete={editorState.mode === 'edit' ? handleDeleteShip : undefined}
        initialData={editorState.data}
        title={editorState.mode === 'add' ? 'Add New Ship' : `Edit ${editorState.targetName}`}
      />
    </div>
  );
}

export default App;
