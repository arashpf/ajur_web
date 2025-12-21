import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "./Breadcrumb.module.css";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

const Breadcrumb = ({ items }) => {
  const router = useRouter();

  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb" dir="rtl">
      <ol className={styles.breadcrumbList}>
        {/* Home Link */}
        <li className={styles.breadcrumbItem}>
          <Link href="/">
            <p className={styles.breadcrumbLink}>خانه</p>
          </Link>
        </li>

        {/* Separator */}
        <li className={styles.breadcrumbSeparator}>
          <ChevronLeftIcon className={styles.breadcrumbIcon} />
        </li>

        {/* Dynamic Items */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <>
              <li
                key={index}
                className={`${styles.breadcrumbItem} ${
                  isLast ? styles.active : ""
                }`}
              >
                {isLast ? (
                  <span className={styles.breadcrumbText}>{item.label}</span>
                ) : (
                  <Link href={item.href}>
                    <p className={styles.breadcrumbLink}>{item.label}</p>
                  </Link>
                )}
              </li>
              {!isLast && (
                <li className={styles.breadcrumbSeparator}>
                  <ChevronLeftIcon className={styles.breadcrumbIcon} />
                </li>
              )}
            </>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
