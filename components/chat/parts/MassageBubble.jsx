// src/components/chat/parts/MassageBubble.jsx
import React, { useMemo } from 'react';
import styles from '../styles/chat.module.css';

const MassageBubble = ({ message, isMe, onMouseOver, onMouseOut }) => {
  const bubbleClass = isMe ? styles.bubbleMe : styles.bubbleOther;

  return (
    <div
      className={`${styles.bubbleBase} ${bubbleClass}`}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      role="article"
      aria-label={`پیام ${isMe ? 'شما' : 'فرستنده'}`}
    >
      <div className={styles.messageText}>{message.text}</div>
      <div className={isMe ? styles.messageTimeRight : styles.messageTimeLeft} aria-hidden>
        {message.status === 'sending' && <span>⏳</span>}
        {message.status === 'delivered' && <span>✓✓</span>}
        {message.status === 'failed' && <span>❌</span>}
        <span style={{ marginInlineStart: 6 }}>{message.time}</span>
      </div>
    </div>
  );
};

export default React.memo(MassageBubble);
