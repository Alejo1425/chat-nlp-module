import React, { useEffect, useRef } from 'react';
import { useChatContext } from '../context/ChatContext';

function MessageList() {
    const { state } = useChatContext();
    const listRef = useRef(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [state.messages]);

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="message-list">
            {state.messages.map((msg, index) => (
                <div
                    key={msg.id || index}
                    className={`message ${msg.fromMe ? 'sent' : 'received'}`}
                >
                    <div className="message-content">
                        <p className="message-text">{msg.text}</p>

                        {/* NLP Badge - shows when data was extracted */}
                        {msg.extractedData && (
                            <span className="nlp-badge" title="Datos extraídos automáticamente">
                                🤖 NLP
                            </span>
                        )}

                        <span className="message-time">{formatTime(msg.timestamp)}</span>
                    </div>
                </div>
            ))}

            {state.messages.length === 0 && (
                <div className="no-messages">
                    <p>No hay mensajes en esta conversación</p>
                </div>
            )}
            <div ref={listRef} />
        </div>
    );
}

export default MessageList;
