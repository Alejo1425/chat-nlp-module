import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { socket, api } from '../services/api';

// Initial state
const initialState = {
    conversations: [],
    activeConversation: null,
    messages: [],
    extractedData: JSON.parse(localStorage.getItem('chat_extracted_data')) || {}, // Load from local storage
    connectionStatus: 'disconnected',
    loading: false,
    error: null
};

// ... existing code ...



// Action types
const ACTIONS = {
    SET_CONVERSATIONS: 'SET_CONVERSATIONS',
    SET_ACTIVE_CONVERSATION: 'SET_ACTIVE_CONVERSATION',
    SET_MESSAGES: 'SET_MESSAGES',
    ADD_MESSAGE: 'ADD_MESSAGE',
    UPDATE_EXTRACTED_DATA: 'UPDATE_EXTRACTED_DATA',
    SET_CONNECTION_STATUS: 'SET_CONNECTION_STATUS',
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR'
};

// Reducer
function chatReducer(state, action) {
    switch (action.type) {
        case ACTIONS.SET_CONVERSATIONS:
            return { ...state, conversations: action.payload };

        case ACTIONS.SET_ACTIVE_CONVERSATION:
            // Mark conversation as read
            const updatedConversations = state.conversations.map(c => {
                if (c.id === action.payload) {
                    return { ...c, unreadCount: 0 };
                }
                return c;
            });
            return {
                ...state,
                activeConversation: action.payload,
                conversations: updatedConversations,
                messages: []
            };

        case ACTIONS.SET_MESSAGES:
            // Consolidate extracted data from all messages
            let consolidatedData = state.extractedData[state.activeConversation] || {};

            action.payload.forEach(msg => {
                if (msg.extractedData) {
                    // Update only fields that are NOT already present (don't overwrite existing data)
                    // unless the existing value is null/undefined
                    Object.keys(msg.extractedData).forEach(key => {
                        const newValue = msg.extractedData[key];
                        // Only set if we don't have a value yet
                        if (newValue && !consolidatedData[key]) {
                            consolidatedData = {
                                ...consolidatedData,
                                [key]: newValue
                            };
                        }
                    });
                }
            });

            const newExtractedData = {
                ...state.extractedData,
                [state.activeConversation]: consolidatedData
            };

            // Persist to local storage
            localStorage.setItem('chat_extracted_data', JSON.stringify(newExtractedData));

            return {
                ...state,
                messages: action.payload,
                extractedData: newExtractedData
            };

        case ACTIONS.ADD_MESSAGE:
            const { message, conversationId } = action.payload;

            // 1. Update messages list if it's the active conversation
            let newMessages = state.messages;
            if (conversationId && conversationId === state.activeConversation) {
                // Check if message already exists
                const exists = state.messages.some(m => m.id === message.id);
                if (!exists) {
                    newMessages = [...state.messages, message];
                }
            }

            // 2. Update conversations list (update last message + unread count + reorder)
            let conversations = [...state.conversations];
            const convIndex = conversations.findIndex(c => c.id === conversationId);

            if (convIndex >= 0) {
                const conv = conversations[convIndex];
                const isUnread = conversationId !== state.activeConversation;

                const updatedConv = {
                    ...conv,
                    lastMessage: { text: message.text },
                    unreadCount: isUnread ? (conv.unreadCount || 0) + 1 : 0
                };

                // Move to top
                conversations.splice(convIndex, 1);
                conversations.unshift(updatedConv);
            } else {
                // New conversation found via socket? Add to top
                // (Optional: fetch contact details properly, for now basic info)
                conversations.unshift({
                    id: conversationId,
                    name: conversationId.split('@')[0], // Fallback name
                    lastMessage: { text: message.text },
                    unreadCount: conversationId !== state.activeConversation ? 1 : 0
                });
            }

            return {
                ...state,
                messages: newMessages,
                conversations: conversations
            };

        case ACTIONS.UPDATE_EXTRACTED_DATA:
            const currentData = state.extractedData[action.payload.conversationId] || {};

            // Safe merge: only update non-null values
            const newData = { ...currentData };
            if (action.payload.data) {
                Object.keys(action.payload.data).forEach(key => {
                    if (action.payload.data[key]) {
                        newData[key] = action.payload.data[key];
                    }
                });
            }

            return {
                ...state,
                extractedData: {
                    ...state.extractedData,
                    [action.payload.conversationId]: newData
                }
            };

        case ACTIONS.MANUAL_UPDATE_EXTRACTED_DATA:
            const updatedManualData = {
                ...state.extractedData,
                [action.payload.conversationId]: {
                    ...state.extractedData[action.payload.conversationId],
                    ...action.payload.data
                }
            };

            // Persist to local storage
            localStorage.setItem('chat_extracted_data', JSON.stringify(updatedManualData));

            return {
                ...state,
                extractedData: updatedManualData
            };

        case ACTIONS.SET_CONNECTION_STATUS:
            return { ...state, connectionStatus: action.payload };

        case ACTIONS.SET_LOADING:
            return { ...state, loading: action.payload };

        case ACTIONS.SET_ERROR:
            return { ...state, error: action.payload };

        default:
            return state;
    }
}

// Context
const ChatContext = createContext(null);

// Provider
export function ChatProvider({ children }) {
    const [state, dispatch] = useReducer(chatReducer, initialState);

    // Socket.IO event listeners
    useEffect(() => {
        socket.on('connect', () => {
            dispatch({ type: ACTIONS.SET_CONNECTION_STATUS, payload: 'connected' });
        });

        socket.on('disconnect', () => {
            dispatch({ type: ACTIONS.SET_CONNECTION_STATUS, payload: 'disconnected' });
        });

        socket.on('new-message', (data) => {
            dispatch({
                type: ACTIONS.ADD_MESSAGE,
                payload: {
                    message: data.message,
                    conversationId: data.conversationId
                }
            });

            // Update extracted data if present
            if (data.message.extractedData) {
                dispatch({
                    type: ACTIONS.UPDATE_EXTRACTED_DATA,
                    payload: {
                        conversationId: data.conversationId,
                        data: data.message.extractedData
                    }
                });
            }
        });

        socket.on('message-sent', (data) => {
            dispatch({
                type: ACTIONS.ADD_MESSAGE,
                payload: {
                    message: data.message,
                    conversationId: data.conversationId
                }
            });
        });

        // Load initial conversations
        loadConversations();

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('new-message');
            socket.off('message-sent');
        };
    }, []);

    // Load conversations
    async function loadConversations() {
        try {
            dispatch({ type: ACTIONS.SET_LOADING, payload: true });
            const response = await api.get('/messages/contacts');
            dispatch({ type: ACTIONS.SET_CONVERSATIONS, payload: response.data });
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        } finally {
            dispatch({ type: ACTIONS.SET_LOADING, payload: false });
        }
    }

    // Select a conversation
    async function selectConversation(conversationId) {
        try {
            dispatch({ type: ACTIONS.SET_ACTIVE_CONVERSATION, payload: conversationId });
            socket.emit('join-conversation', conversationId);

            const response = await api.get(`/messages/history/${encodeURIComponent(conversationId)}`);
            dispatch({ type: ACTIONS.SET_MESSAGES, payload: response.data });
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        }
    }

    // Send a message
    async function sendMessage(text) {
        if (!state.activeConversation || !text.trim()) return;

        try {
            await api.post('/messages/send', {
                to: state.activeConversation,
                text: text.trim()
            });
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        }
    }

    // Create CRM opportunity
    async function createOpportunity(notes = '') {
        if (!state.activeConversation) return;

        const data = state.extractedData[state.activeConversation];
        if (!data) return;

        try {
            const response = await api.post('/crm/opportunity', {
                contactId: state.activeConversation,
                extractedData: data,
                notes
            });
            return response.data;
        } catch (error) {
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            throw error;
        }
    }

    // Manual update of extracted data
    function updateExtractedData(conversationId, data) {
        dispatch({
            type: ACTIONS.MANUAL_UPDATE_EXTRACTED_DATA,
            payload: { conversationId, data }
        });
    }

    const value = {
        state,
        dispatch,
        selectConversation,
        sendMessage,
        createOpportunity,
        loadConversations,
        updateExtractedData
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
}

// Hook
export function useChatContext() {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within a ChatProvider');
    }
    return context;
}

export default ChatContext;
