import React from 'react';
import { useChatContext } from '../context/ChatContext';

function ConversationList() {
    const { state, selectConversation } = useChatContext();

    const formatPhone = (jid) => {
        if (!jid) return '';
        return jid.replace('@s.whatsapp.net', '').replace('@g.us', '');
    };

    const getLastMessage = (conversation) => {
        return conversation.lastMessage?.text || 'Sin mensajes';
    };

    return (
        <div className="conversation-list">
            <div className="search-bar">
                <input type="text" placeholder="Buscar conversación..." />
            </div>

            <div className="conversations">
                {state.conversations.map((conv) => (
                    <div
                        key={conv.id}
                        className={`conversation-item ${state.activeConversation === conv.id ? 'active' : ''}`}
                        onClick={() => selectConversation(conv.id)}
                    >
                        <div className="conversation-avatar">
                            {conv.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="conversation-info">
                            <div className="conversation-name">
                                {conv.name || formatPhone(conv.id)}
                            </div>
                            <div className="conversation-preview">
                                {getLastMessage(conv)}
                            </div>
                        </div>
                        {conv.unreadCount > 0 && (
                            <span className="unread-badge">{conv.unreadCount}</span>
                        )}
                    </div>
                ))}

                {state.conversations.length === 0 && !state.loading && (
                    <div className="no-conversations">
                        <p>No hay conversaciones</p>
                    </div>
                )}

                {state.loading && (
                    <div className="loading">Cargando...</div>
                )}
            </div>
        </div>
    );
}

export default ConversationList;
