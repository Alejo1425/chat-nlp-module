import React from 'react';
import { useChatContext } from '../context/ChatContext';

function ContactInfo() {
    const { state } = useChatContext();

    const formatPhone = (jid) => {
        if (!jid) return '';
        return jid.replace('@s.whatsapp.net', '').replace('@g.us', '');
    };

    const getContactName = () => {
        const conv = state.conversations.find(c => c.id === state.activeConversation);
        return conv?.name || formatPhone(state.activeConversation);
    };

    return (
        <div className="contact-info-header">
            <div className="contact-avatar">
                {getContactName()[0]?.toUpperCase() || '?'}
            </div>
            <div className="contact-details">
                <h2>{getContactName()}</h2>
                <span className="contact-phone">{formatPhone(state.activeConversation)}</span>
            </div>
        </div>
    );
}

export default ContactInfo;
