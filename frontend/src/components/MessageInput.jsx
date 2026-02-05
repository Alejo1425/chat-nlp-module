import React, { useState } from 'react';
import { useChatContext } from '../context/ChatContext';

function MessageInput() {
    const [text, setText] = useState('');
    const { sendMessage } = useChatContext();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim()) {
            sendMessage(text);
            setText('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form className="message-input" onSubmit={handleSubmit}>
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe un mensaje..."
                autoComplete="off"
            />
            <button type="submit" disabled={!text.trim()}>
                ➤
            </button>
        </form>
    );
}

export default MessageInput;
