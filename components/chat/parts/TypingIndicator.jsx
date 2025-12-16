// src/components/chat/parts/TypingIndicator.jsx
import React from 'react';
import styles from '../styles/chat.module.css';

const TypingIndicator = () => {
  return (
    <div className={styles.typingIndicator} aria-live="polite">
      <span className={styles.typingText}>در حال تایپ...</span>
      <div className={styles.typingDots}>
        <div style={{ animationDelay: '0s' }} />
        <div style={{ animationDelay: '0.2s' }} />
        <div style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  );
};

export default React.memo(TypingIndicator);
