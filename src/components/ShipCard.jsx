import { getShipStatus } from '../utils/dataUtils';
import { getResourceName } from '../data/resourceMappings';
import { shipTypeAliases } from '../data/shipTypeMappings';

const ShipCard = ({ ship, userState, onUpdate, onEdit }) => {
    const currentStatus = getShipStatus(ship, userState);


    // Handlers
    const toggleAcquired = () => {
        const newAcquired = !userState.acquired;
        if (!newAcquired) {
            // Clearing acquisition clears stages too
            onUpdate({ ...userState, acquired: false, stages: {} });
        } else {
            onUpdate({ ...userState, acquired: true });
        }
    };

    const togglePriority = () => {
        onUpdate({ ...userState, priority: !userState.priority });
    };

    const toggleTask = () => {
        onUpdate({ ...userState, task: !userState.task });
    };

    const handleStageCheck = (index) => {
        // If checking index N, auto-check 0 to N. 
        // If unchecking index N, auto-uncheck N to Max.
        const newStages = { ...(userState.stages || {}) };
        const isChecked = !!newStages[index];

        if (isChecked) {
            // Uncheck this and all after
            for (let i = index; i < ship.stages.length; i++) {
                delete newStages[i];
            }
        } else {
            // Check this and all before
            for (let i = 0; i <= index; i++) {
                newStages[i] = true;
            }
            // Also ensure base acquired is true
            if (!userState.acquired) {
                onUpdate({ ...userState, acquired: true, stages: newStages });
                return;
            }
        }
        onUpdate({ ...userState, stages: newStages });
    };

    // Class progression display
    let classDisplay = ship.class;
    if (ship.stages) {
        const uniqueClasses = [ship.class];
        ship.stages.forEach(stage => {
            if (stage.class && stage.class !== uniqueClasses[uniqueClasses.length - 1]) {
                uniqueClasses.push(stage.class);
            }
        });
        if (uniqueClasses.length > 1) {
            classDisplay = uniqueClasses.join(' → ');
        }
    }

    const cardClass = `glass-panel ship-card status-${currentStatus} animate-fade-in`;

    return (
        <div className={cardClass}>
            {/* Background Image - Faded */}
            <div
                className="card-bg-image"
                style={{ backgroundImage: `url(${ship.imageUrl})` }}
            />

            {/* Absolute Actions (Top Right) */}
            <div className="card-actions">
                <button
                    className="btn-icon"
                    onClick={onEdit}
                    title="Edit JSON"
                >
                    ⚙️
                </button>
                <button
                    className={`btn-icon ${userState.task ? 'active-red' : ''}`}
                    onClick={toggleTask}
                    title="Task Needed"
                >
                    !
                </button>
                <button
                    className={`btn-icon ${userState.priority ? 'active-gold' : ''}`}
                    onClick={togglePriority}
                    title="Priority"
                >
                    ★
                </button>
                <button
                    className={`btn-icon ${userState.acquired ? 'active-blue' : ''}`}
                    onClick={toggleAcquired}
                    title="Acquired"
                >
                    ⚓
                </button>
            </div>

            {/* Content */}
            <div className="card-content">

                {/* Header: Compact */}
                <div className="flex-col" style={{ gap: '2px' }}>
                    <div className="flex-row">
                        <span className="badge badge-blue">{ship.type}</span>
                        <span className="text-xs text-sec">{classDisplay}</span>
                    </div>
                    <div className="flex-row" style={{ alignItems: 'baseline' }}>
                        <a
                            href={ship.wikiUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xl text-pri"
                            title="Open Wiki"
                        >
                            {ship.name}
                        </a>
                        <span className="text-sm text-sec">{ship.hiragana}</span>
                    </div>
                </div>

                {/* Separator - Minimal */}
                <div style={{ height: '1px', background: 'var(--glass-border)', margin: '8px 0' }} />

                {/* Remodel Stages */}
                <div className="flex-col" style={{ gap: '6px' }}>
                    {ship.stages.map((stage, idx) => {
                        const isChecked = !!(userState.stages?.[idx]);
                        // Check if type changes from previous state (base ship or prev stage)
                        const prevType = idx === 0 ? ship.type : (ship.stages[idx - 1].type || ship.type);
                        const isTypeChange = stage.type && stage.type !== prevType;

                        return (
                            <div key={idx} className="flex-row" style={{ flexWrap: 'wrap', opacity: isChecked ? 0.6 : 1 }}>
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleStageCheck(idx)}
                                    style={{ cursor: 'pointer', transform: 'scale(1.1)', accentColor: 'var(--accent-primary)' }}
                                />

                                {isTypeChange && (
                                    <span className="badge badge-blue">{stage.type}</span>
                                )}

                                <span className="font-medium text-sm">{stage.name}</span>
                                <span className="text-xs text-sec">Lv.{stage.level}</span>

                                {/* Resources */}
                                <div className="flex-row" style={{ marginLeft: 'auto', flexWrap: 'wrap' }}>
                                    {stage.resources && Object.entries(stage.resources).map(([resName, count]) => (
                                        <span key={resName} className="badge badge-gold" title={resName}>
                                            {getResourceName(resName)} x{count}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
};

export default ShipCard;
