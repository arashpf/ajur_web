import React from "react";
import styles from "./DealButton.module.css";

export default function DealButton({ title, src, onClick, style = {}, subtitle }) {
  return (
    <button
      type="button"
      className={styles.card}
      onClick={onClick}
      style={style}
      aria-label={title}
    >
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.content}>
        <div className={styles.media}>
          <img src={src || "/placeholder.svg"} alt={title} className={styles.image} />
        </div>

        <div className={styles.text}>
          <h3 className={styles.title}>{title}</h3>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>

        <div className={styles.cta}>
          <span className={styles.ctaText}>انتخاب</span>
          <svg className={styles.arrow} viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path d="M14 6L8 12l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
      </div>
    </button>
  );
}
