// src/components/chat/ChatUi.jsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import useChatSocket from '../../hooks/useChatSocket';
import {
  MassageBubble,
  TypingIndicator,
  RulesSection,
  QuickActions
} from './parts';
import styles from './styles/chat.module.css';

const ChatUi = ({
  wsUrl = null,
  user = { id: 1, name: 'کاربر', avatar: 'ک' },
  conversationId = 1,
  contactInfo = { id: 1, name: 'نگار صدیقی', avatar: 'ن', isOnline: false },
  propertyInfo = { id: 123, title: 'آپارتمان ۱۴۰ متری در الهیه', price: '۱۵,۰۰۰,۰۰۰,۰۰۰ تومان' },
  onMessageSent = () => {},
  onError = () => {},
  onTypingStateChange = () => {},
  onCloseChat = () => {}
}) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showRules, setShowRules] = useState(true);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const containerRef = useRef(null);
  const lastMessageLengthRef = useRef(0);

  const handleSocketStateChange = useCallback((connected) => {
    setIsConnected(connected);
  }, []);

  const handleSocketMessage = useCallback((data) => {
    // expected shape from server: { type: 'message.new', message: { id, body, senderId, created_at, tempId } }
    if (data?.type === 'message.new') {
      const srvMsg = data.message || {};

      // hide rules once conversation has traffic
      setShowRules(prev => prev ? false : prev);

      setMessages(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        if (srvMsg.id && existingIds.has(srvMsg.id)) {
          return prev;
        }

        const serverTempId = srvMsg.tempId || srvMsg.temp_id;
        if (serverTempId) {
          const messageIndex = prev.findIndex(m => m.id === serverTempId || m.tempId === serverTempId);
          if (messageIndex !== -1) {
            const newMessages = [...prev];
            const isMe = (srvMsg.senderId !== undefined && srvMsg.senderId !== null)
              ? (srvMsg.senderId === user.id)
              : (prev[messageIndex].isMe === true);

            newMessages[messageIndex] = {
              id: srvMsg.id || prev[messageIndex].id,
              tempId: serverTempId,
              text: srvMsg.body,
              isMe,
              time: new Date(srvMsg.created_at || Date.now())
                .toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
              status: 'delivered',
              timestamp: new Date(srvMsg.created_at || Date.now())
            };
            return newMessages;
          }
        }

        const now = Date.now();
        const serverTimestamp = new Date(srvMsg.created_at || now).getTime();
        const isDuplicate = prev.some(m =>
          m.text === srvMsg.body &&
          Math.abs((m.timestamp?.getTime?.() || now) - serverTimestamp) < 5000
        );

        if (!isDuplicate) {
          const isMe = srvMsg.senderId === user.id;
          return [...prev, {
            id: srvMsg.id || `srv-${Date.now()}`,
            text: srvMsg.body,
            isMe,
            time: new Date(srvMsg.created_at || Date.now())
              .toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
            status: 'delivered',
            timestamp: new Date(srvMsg.created_at || Date.now())
          }];
        }

      
        return prev;
      });

    } else if (data?.type === 'typing.start') {
      setIsTyping(true);
      onTypingStateChange(true);
    } else if (data?.type === 'typing.stop') {
      setIsTyping(false);
      onTypingStateChange(false);
    } else if (data?.type === 'conversation.updated') {
      // optional: update conversation meta
      // console.log('Conversation updated:', data.conversation);
    }
  }, [onTypingStateChange, user.id]);

  const { connected, send } = useChatSocket({
    wsUrl,
    onMessage: handleSocketMessage,
    onStateChange: handleSocketStateChange,
  });

  // expose connected state if needed
  useEffect(() => setIsConnected(connected), [connected]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  useEffect(() => {
    if (messages.length > lastMessageLengthRef.current) {
      scrollToBottom();
      lastMessageLengthRef.current = messages.length;
    }
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      const newH = Math.min(ta.scrollHeight, 120);
      ta.style.height = `${newH}px`;
    }
  }, [inputText]);

  const handleInputChange = useCallback((e) => {
    const newValue = e.target.value;
    setInputText(newValue);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }

    if (newValue.length > 500) return;

    if (newValue.trim()) {
      try {
        send({ type: 'typing.start', conversationId });
      } catch (err) {
        onError('connection_error', err);
      }

      const to = setTimeout(() => {
        try {
          send({ type: 'typing.stop', conversationId });
        } catch (err) {
          onError('connection_error', err);
        }
        setTypingTimeout(null);
      }, 2000);

      setTypingTimeout(to);
    } else {
      try {
        send({ type: 'typing.stop', conversationId });
      } catch (err) {
        onError('connection_error', err);
      }
    }
  }, [send, conversationId, typingTimeout, onError]);

  const sendMessage = useCallback((text) => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > 500) return;

    setShowRules(false);

    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      tempId,
      text: trimmed,
      isMe: true,
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      status: 'sending',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, optimistic]);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }

    try {
      send({
        type: 'message.send',
        conversationId,
        body: trimmed,
        tempId,
        senderId: user.id,
        metadata: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      });

      send({ type: 'typing.stop', conversationId });

      onMessageSent({
        id: tempId,
        text: trimmed,
        conversationId,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m));
      onError('send_failed', err);
    }

    setInputText('');
  }, [send, conversationId, user.id, typingTimeout, onMessageSent, onError]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  }, [sendMessage, inputText]);

  const handleQuickAction = useCallback((text) => {
    sendMessage(text);
  }, [sendMessage]);

  const handleMessageMouseOver = useCallback((e) => {
    e.currentTarget.style.transform = 'scale(1.02)';
  }, []);
  const handleMessageMouseOut = useCallback((e) => {
    e.currentTarget.style.transform = 'scale(1)';
  }, []);

  const handleCloseChat = useCallback(() => {
    if (onCloseChat) onCloseChat();
  }, [onCloseChat]);

  return (
    <div ref={containerRef} className={styles.container} role="main" aria-label="چت پشتیبانی">
      <header className={styles.header}>
        <button
          onClick={handleCloseChat}
          className={styles.closeButton}
          aria-label="بستن چت"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>

        <div className={styles.avatar} aria-hidden>
          {contactInfo.avatar || user.avatar}
        </div>

        <div className={styles.headerInfo}>
          <div className={styles.contactName}>{contactInfo.name}</div>
          <div className={styles.contactStatus}>
            {isConnected && contactInfo.isOnline ? <span>آنلاین</span> : <span>آفلاین</span>}
          </div>
        </div>
      </header>

      <section className={styles.propertyInfoSection} aria-labelledby="property-info">
        <div className={styles.propertyRow}>
          <div className={styles.propertyTitle} id="property-info">{propertyInfo.title}</div>
          <div className={styles.propertyPrice}>{propertyInfo.price}</div>
        </div>
      </section>

      <section className={`${styles.messagesContainer} messages-container`} aria-live="polite" aria-atomic="false">
        {showRules && messages.length === 0 && <RulesSection />}
        {messages.map(m => (
          <MassageBubble
            key={m.id}
            message={m}
            isMe={!!m.isMe}
            onMouseOver={handleMessageMouseOver}
            onMouseOut={handleMessageMouseOut}
          />
        ))}

        {isTyping && <TypingIndicator />}

        <div ref={messagesEndRef} aria-hidden />
      </section>

      <QuickActions onActionClick={handleQuickAction} />

      <section className={styles.inputContainer} aria-label="ورودی پیام">
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="پیام خود را بنویسید"
          className={styles.textInput}
          rows={1}
          aria-label="متن پیام"
          maxLength={500}
          dir="rtl"
        />

        <button
          onClick={() => sendMessage(inputText)}
          disabled={!inputText.trim()}
          className={`${styles.sendButton} ${!inputText.trim() ? styles.sendDisabled : ''}`}
          aria-label="ارسال پیام"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ transform: 'scaleX(-1)' }} aria-hidden>
            <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" />
          </svg>
        </button>
      </section>
    </div>
  );
};

export default React.memo(ChatUi);
