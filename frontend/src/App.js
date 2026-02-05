import React, { useState } from 'react';
import ConversationList from './components/ConversationList';
import ChatPanel from './components/ChatPanel';
import ExtractedDataPanel from './components/ExtractedDataPanel';
import InventoryPanel from './components/InventoryPanel';
import { useChatContext } from './context/ChatContext';

function App() {
    const { state } = useChatContext();
    const [showInventory, setShowInventory] = useState(false);

    return (
        <div className="app-container">
            {/* Left Sidebar - Conversation List */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h1>Chat Asesores</h1>
                    <span className={`connection-status ${state.connectionStatus}`}>
                        {state.connectionStatus === 'connected' ? '●' : '○'}
                    </span>
                </div>
                <ConversationList />
            </aside>

            {/* Center - Chat Panel */}
            <main className="chat-main">
                {state.activeConversation ? (
                    <ChatPanel />
                ) : (
                    <div className="no-chat-selected">
                        <div className="no-chat-icon">💬</div>
                        <p>Selecciona una conversación para comenzar</p>
                    </div>
                )}
            </main>

            {/* Right Sidebar - Extracted Data & Inventory */}
            <aside className="info-sidebar">
                <div className="info-tabs">
                    <button
                        className={!showInventory ? 'active' : ''}
                        onClick={() => setShowInventory(false)}
                    >
                        Datos Cliente
                    </button>
                    <button
                        className={showInventory ? 'active' : ''}
                        onClick={() => setShowInventory(true)}
                    >
                        Inventario
                    </button>
                </div>

                {showInventory ? (
                    <InventoryPanel />
                ) : (
                    <ExtractedDataPanel />
                )}
            </aside>
        </div>
    );
}

export default App;
