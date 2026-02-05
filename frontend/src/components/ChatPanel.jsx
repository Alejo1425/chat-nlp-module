import React from 'react';
import { useChatContext } from '../context/ChatContext';
import ContactInfo from './ContactInfo';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

function ChatPanel() {
    const { state } = useChatContext();

    if (!state.activeConversation) {
        return null;
    }

    return (
        <div className="chat-panel">
            <ContactInfo />
            <MessageList />
            <MessageInput />
        </div>
    );
}

export default ChatPanel;
