import React, { useState } from 'react';
import { useChatContext } from '../context/ChatContext';

function ExtractedDataPanel() {
    const { state, createOpportunity, updateExtractedData } = useChatContext();
    const [notes, setNotes] = useState('');
    const [creating, setCreating] = useState(false);
    const [success, setSuccess] = useState(false);

    const extractedData = state.extractedData[state.activeConversation] || {};

    const handleCreateOpportunity = async () => {
        if (!hasAnyData()) return;

        setCreating(true);
        try {
            await createOpportunity(notes);
            setSuccess(true);
            setNotes('');
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Error creating opportunity:', error);
        } finally {
            setCreating(false);
        }
    };

    const hasAnyData = () => {
        return Object.values(extractedData).some(v => v !== null && v !== undefined);
    };

    const dataFields = [
        { key: 'name', label: 'Nombre', icon: '👤' },
        { key: 'cedula', label: 'Cédula', icon: '🪪' },
        { key: 'email', label: 'Email', icon: '📧' },
        { key: 'phone', label: 'Teléfono', icon: '📱' },
        { key: 'profession', label: 'Profesión', icon: '💼' },
        { key: 'motoModel', label: 'Modelo Moto', icon: '🏍️' }
    ];

    if (!state.activeConversation) {
        return (
            <div className="extracted-data-panel empty">
                <p>Selecciona una conversación para ver los datos extraídos</p>
            </div>
        );
    }

    return (
        <div className="extracted-data-panel">
            <h3>Datos Extraídos (NLP)</h3>

            <div className="data-fields">
                {dataFields.map(({ key, label, icon }) => (
                    <div key={key} className={`data-field ${extractedData[key] ? 'filled' : ''}`}>
                        <span className="field-icon">{icon}</span>
                        <div className="field-content">
                            <label>{label}</label>
                            <input
                                type="text"
                                className="field-input"
                                value={extractedData[key] || ''}
                                onChange={(e) => updateExtractedData(state.activeConversation, { [key]: e.target.value })}
                                placeholder="—"
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="opportunity-section">
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notas adicionales para la oportunidad..."
                    rows={3}
                />

                <button
                    className={`create-opportunity-btn ${success ? 'success' : ''}`}
                    onClick={handleCreateOpportunity}
                    disabled={!hasAnyData() || creating}
                >
                    {creating ? 'Creando...' : success ? '✓ Creada!' : '+ Crear Oportunidad'}
                </button>
            </div>
        </div>
    );
}

export default ExtractedDataPanel;
