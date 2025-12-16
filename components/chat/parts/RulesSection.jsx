// src/components/chat/parts/RulesSection.jsx
import React from 'react';
import styles from '../styles/chat.module.css';

const RulesSection = () => (
  <div className={styles.rulesSection} role="alert" aria-labelledby="rules-title">
    <div className={styles.rulesTitleWrap} id="rules-title" aria-hidden>
      <span className={styles.rulesTitleText}>نکات مهم</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#005a87" aria-hidden>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
    </div>

    <div className={styles.rulesText}>
      طبق قوانین جمهوری اسلامی ایران، کلیه مکالمات به مدت ۶ ماه نگهداری شده و در صورت نیاز
      در اختیار مراجع قضایی قرار می‌گیرد. لطفاً از ارسال اطلاعات حساس و خارج از چارچوب معامله خودداری فرمایید.
    </div>
  </div>
);

export default React.memo(RulesSection);
