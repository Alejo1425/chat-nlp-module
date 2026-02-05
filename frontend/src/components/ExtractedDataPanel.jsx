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
            const serverError = error.response?.data;
            const errorMessage = serverError?.details || serverError?.error || error.message;
            const crmMessage = serverError?.crmError ? JSON.stringify(serverError.crmError, null, 2) : '';
            const debugUrl = serverError?.debug?.config ?
                `\nURL: ${serverError.debug.config.baseURL}${serverError.debug.config.url}` : '';

            alert(`Error al crear la oportunidad:\n${errorMessage}\n${crmMessage}${debugUrl}`);
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
                            <div style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>
                                #{opportunity.opportunityId || opportunity.id || opportunity.raw?.IdRegistro || opportunity.raw?.IDRegistro || 'N/A'}
                            </div>
                        </div>
                    </div>
                    {/* Post-Creation Actions */}
                    <PostSaleActions opportunityId={opportunity.opportunityId || opportunity.id || opportunity.raw?.IdRegistro || opportunity.raw?.IDRegistro} />
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

// Subcomponent for Post-Sale Actions - REDESIGNED UI
function PostSaleActions({ opportunityId }) {
    const { updateOpportunityStatus } = useChatContext();
    const [notes, setNotes] = useState('');
    const [loadingAction, setLoadingAction] = useState(false);
    const [actionResult, setActionResult] = useState(null);

    const handleAction = async (type) => {
        if (!opportunityId) return;

        try {
            setLoadingAction(true);
            setActionResult(null);
            await updateOpportunityStatus(opportunityId, type, notes);
            setActionResult({
                success: true,
                message: type ? `Estado actualizado a ${type === 'lost' ? 'Perdida' : 'Cotización'}` : 'Nota agregada correctamente'
            });
            setNotes('');
        } catch (error) {
            setActionResult({ success: false, message: error.message || 'Error al procesar la acción' });
        } finally {
            setLoadingAction(false);
        }
    };

    // Styled button component
    const ActionButton = ({ onClick, disabled, variant, children }) => {
        const baseStyle = {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '10px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            border: 'none',
            flex: 1,
            opacity: disabled ? 0.6 : 1
        };

        const variants = {
            danger: {
                background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                color: '#fff',
                boxShadow: '0 2px 8px rgba(220, 53, 69, 0.3)'
            },
            info: {
                background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
                color: '#fff',
                boxShadow: '0 2px 8px rgba(23, 162, 184, 0.3)'
            },
            success: {
                background: 'linear-gradient(135deg, #28a745 0%, #218838 100%)',
                color: '#fff',
                boxShadow: '0 2px 8px rgba(40, 167, 69, 0.3)'
            }
        };

        return (
            <button
                onClick={onClick}
                disabled={disabled}
                style={{ ...baseStyle, ...variants[variant] }}
            >
                {children}
            </button>
        );
    };

    return (
        <div style={{
            marginTop: '20px',
            padding: '16px',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '10px',
            textAlign: 'left'
        }}>
            <div style={{
                fontSize: '12px',
                color: '#888',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
            }}>
                ⚙️ Gestión de Oportunidad
            </div>

            {/* Status Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                <ActionButton
                    variant="danger"
                    onClick={() => handleAction('lost')}
                    disabled={loadingAction}
                >
                    ❌ Perdida
                </ActionButton>
                <ActionButton
                    variant="info"
                    onClick={() => handleAction('quote')}
                    disabled={loadingAction}
                >
                    📄 Cotizar
                </ActionButton>
            </div>

            {/* Notes Section */}
            <textarea
                placeholder="Escribe una nota de seguimiento..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={loadingAction}
                style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '13px',
                    background: '#1a1a1a',
                    color: '#eee',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    resize: 'none',
                    marginBottom: '10px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                }}
                rows={2}
            />

            {/* Add Notes Button */}
            <ActionButton
                variant="success"
                onClick={() => handleAction(null)}
                disabled={loadingAction || !notes.trim()}
            >
                {loadingAction ? '⏳ Procesando...' : '💬 Guardar Nota'}
            </ActionButton>

            {/* Feedback Message */}
            {actionResult && (
                <div style={{
                    marginTop: '12px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: actionResult.success ? 'rgba(40, 167, 69, 0.15)' : 'rgba(220, 53, 69, 0.15)',
                    color: actionResult.success ? '#5cb85c' : '#d9534f',
                    border: `1px solid ${actionResult.success ? 'rgba(40, 167, 69, 0.3)' : 'rgba(220, 53, 69, 0.3)'}`
                }}>
                    {actionResult.success ? '✅' : '⚠️'} {actionResult.message}
                </div>
            )}
        </div>
    );
}

export default ExtractedDataPanel;
