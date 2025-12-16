// src/components/chat/parts/QuickActions.jsx
import React from 'react';
import styles from '../styles/chat.module.css';

const QuickActions = ({ onActionClick = () => {} }) => {
  const messages = [
    { id: 1, text: 'درود' },
    { id: 2, text: 'آیا تخفیف داره؟' },
    { id: 3, text: 'لطفا اطلاعات کامل آگهی رو ارسال کنید' },
    { id: 4, text: 'میخوام بازدید رزرو کنم' }
  ];

  return (
    <div className={styles.quickActionsContainer}>
      <div className={styles.quickMessagesWrapper}>
        {messages.map(msg => (
          <div
            key={msg.id}
            onClick={() => onActionClick(msg.text)}
            className={styles.quickMessage}
          >
            {msg.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(QuickActions);
