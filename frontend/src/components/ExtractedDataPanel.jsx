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

    const opportunity = state.opportunities[state.activeConversation];

    if (!state.activeConversation) {
        return (
            <div className="extracted-data-panel empty">
                <p>Selecciona una conversación para ver los datos extraídos</p>
            </div>
        );
    }

    // If opportunity exists, show summary
    if (opportunity) {
        return (
            <div className="extracted-data-panel">
                <div className="opportunity-success-card" style={{
                    background: 'rgba(37, 211, 102, 0.1)',
                    border: '1px solid #25d366',
                    borderRadius: '8px',
                    padding: '16px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                    <h3 style={{ color: '#25d366', fontSize: '18px', marginBottom: '8px' }}>¡Oportunidad Creada!</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
                        La oportunidad ha sido registrada exitosamente en Impulsa CRM.
                    </p>

                    <div style={{ background: 'var(--bg-dark)', padding: '12px', borderRadius: '6px', textAlign: 'left' }}>
                        <div style={{ marginBottom: '8px' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>ID Registro:</span>
                            <div style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>#{opportunity.opportunityId}</div>
                        </div>
                        {/* Add more details if returned by backend */}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="extracted-data-panel">
            <h3>Datos Extraídos (NLP)</h3>

            <div className="data-fields">
                {/* Document Type & Number Group */}
                <div className="data-field filled">
                    <span className="field-icon">🪪</span>
                    <div className="field-content">
                        <label>Documento</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <select
                                className="field-input"
                                style={{ width: '60px' }}
                                value={extractedData.documentType || 'CC'}
                                onChange={(e) => updateExtractedData(state.activeConversation, { documentType: e.target.value })}
                            >
                                <option value="CC">CC</option>
                                <option value="NIT">NIT</option>
                                <option value="TI">TI</option>
                                <option value="CE">CE</option>
                                <option value="PS">PS</option>
                            </select>
                            <input
                                type="text"
                                className="field-input"
                                value={extractedData.cedula || ''}
                                onChange={(e) => updateExtractedData(state.activeConversation, { cedula: e.target.value })}
                                placeholder="Número"
                            />
                        </div>
                    </div>
                </div>

                {/* Standard Fields */}
                <div className={`data-field ${extractedData.name ? 'filled' : ''}`}>
                    <span className="field-icon">👤</span>
                    <div className="field-content">
                        <label>Nombre</label>
                        <input
                            type="text"
                            className="field-input"
                            value={extractedData.name || ''}
                            onChange={(e) => updateExtractedData(state.activeConversation, { name: e.target.value })}
                            placeholder="Nombre Completo"
                        />
                    </div>
                </div>

                <div className={`data-field ${extractedData.email ? 'filled' : ''}`}>
                    <span className="field-icon">📧</span>
                    <div className="field-content">
                        <label>Email</label>
                        <input
                            type="text"
                            className="field-input"
                            value={extractedData.email || ''}
                            onChange={(e) => updateExtractedData(state.activeConversation, { email: e.target.value })}
                            placeholder="correo@ejemplo.com"
                        />
                    </div>
                </div>

                <div className={`data-field ${extractedData.phone ? 'filled' : ''}`}>
                    <span className="field-icon">📱</span>
                    <div className="field-content">
                        <label>Teléfono</label>
                        <input
                            type="text"
                            className="field-input"
                            value={extractedData.phone || ''}
                            onChange={(e) => updateExtractedData(state.activeConversation, { phone: e.target.value })}
                            placeholder="Número Celular"
                        />
                    </div>
                </div>

                {/* Product Group */}
                <div className={`data-field ${extractedData.motoModel ? 'filled' : ''}`}>
                    <span className="field-icon">🏍️</span>
                    <div className="field-content">
                        <label>Moto de Interés</label>
                        <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                            <input
                                type="text"
                                className="field-input"
                                value={extractedData.motoModel || ''}
                                onChange={(e) => updateExtractedData(state.activeConversation, { motoModel: e.target.value })}
                                placeholder="Modelo (ej: Raider 125)"
                            />
                            <input
                                type="text"
                                className="field-input"
                                value={extractedData.brand || ''}
                                onChange={(e) => updateExtractedData(state.activeConversation, { brand: e.target.value })}
                                placeholder="Marca (ej: TVS)"
                            />
                        </div>
                    </div>
                </div>

                <div className="data-field filled">
                    <span className="field-icon">📢</span>
                    <div className="field-content">
                        <label>Campaña</label>
                        <select
                            className="field-input"
                            value={extractedData.campaign || 'REDES COLOMBIANO'}
                            onChange={(e) => updateExtractedData(state.activeConversation, { campaign: e.target.value })}
                        >
                            <option value="SALA">SALA</option>
                            <option value="REFERIDO">REFERIDO</option>
                            <option value="TIKTOK COLOMBIANO">TIKTOK COLOMBIANO</option>
                            <option value="REDES COLOMBIANO">REDES COLOMBIANO</option>
                            <option value="TIKTOK EXTRANJERO">TIKTOK EXTRANJERO</option>
                            <option value="REDES EXTRANJERO">REDES EXTRANJERO</option>
                        </select>
                    </div>
                </div>
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
