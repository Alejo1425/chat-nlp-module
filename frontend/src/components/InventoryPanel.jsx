import React, { useState, useEffect } from 'react';
import { crmApi } from '../services/api';

function InventoryPanel() {
    const [inventory, setInventory] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async (searchTerm = '') => {
        setLoading(true);
        try {
            const response = await crmApi.getInventory({ search: searchTerm });
            setInventory(response.data);
        } catch (error) {
            console.error('Error loading inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        loadInventory(search);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="inventory-panel">
            <h3>Inventario Auteco</h3>

            <form className="inventory-search" onSubmit={handleSearch}>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar modelo..."
                />
                <button type="submit">🔍</button>
            </form>

            <div className="inventory-list">
                {loading ? (
                    <div className="loading">Cargando inventario...</div>
                ) : (
                    inventory.map((item) => (
                        <div
                            key={item.id}
                            className={`inventory-item ${expandedId === item.id ? 'expanded' : ''}`}
                            onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                        >
                            <div className="item-header">
                                <span className="item-model">{item.model}</span>
                                <span className={`item-stock ${item.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                                    {item.stock > 0 ? `${item.stock} disp.` : 'Agotado'}
                                </span>
                            </div>

                            <div className="item-details">
                                <div className="item-price">{formatPrice(item.price)}</div>
                                <div className="item-category">{item.category}</div>
                            </div>

                            {expandedId === item.id && (
                                <div className="item-expanded">
                                    <button className="send-info-btn">
                                        📤 Enviar info al chat
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}

                {!loading && inventory.length === 0 && (
                    <div className="no-results">
                        No se encontraron modelos
                    </div>
                )}
            </div>
        </div>
    );
}

export default InventoryPanel;
