import React from "react";

export default function FileRequest({ files: propFiles, onCallClick, onActionClick }) {
  const files = propFiles || [
    { title: "آپارتمان 2خوابه - شهرک", type: "فایل مسکونی", price: "۸۵ میلیون" },
    { title: "ویلای ساحلی", type: "فایل ویلایی", price: "۳۲۰ میلیون" },
    { title: "مغازه تجاری", type: "فایل تجاری", price: "۱۸۰ میلیون" },
  ];

  // Pre-generate a random X-offset for each floating file to mimic motion variety.
  const offsets = React.useMemo(
    () => files.map(() => Math.round(Math.random() * 120 - 60)),
    [files.length]
  );

  return (
    <section className="fr-wrapper">
      <header className="fr-header">
        <h2 className="fr-title">فایل مورد نظر خود را درخواست دهید</h2>
        <p className="fr-sub">ربات هوشمند آجر در حال جستجوی بهترین املاک برای شماست — درخواست‌تان را ثبت کنید تا پیشنهادات مناسب برایتان ارسال شود.</p>
      </header>

      <div className="fr-grid">
        <div className="fr-left">
          {/* Floating files: CSS keyframes + inline style variables for variety */}
          {files.map((file, idx) => (
            <div
              key={idx}
              className="fr-floating"
              style={{
                // custom CSS variable for horizontal offset and animation delay
                ["--offset" /* no hyphen in JS identifier; it's used as a property name */]: `${offsets[idx]}px`,
                animationDelay: `${idx * 0.8}s`,
              }}
            >
              <div className="fr-file-title">{file.title}</div>
              <div className="fr-file-meta">
                <span>{file.type}</span>
                <span className="fr-price">{file.price}</span>
              </div>
            </div>
          ))}

          {/* Robot: simple CSS bob + small rotating parts */}
          <div className="fr-robot-wrap">
            <svg className="fr-robot" viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden>
              {/* Antenna */}
              <line className="fr-antenna" x1="100" y1="20" x2="100" y2="40" stroke="#6B7280" strokeWidth="3" strokeLinecap="round" />
              <circle className="fr-antenna-dot" cx="100" cy="20" r="6" fill="#6B7280" />

              {/* Ajur logo in SVG (loads from /logo/ajur.png) */}
              <image href="/logo/ajur.png" x="70" y="8" width="60" height="20" preserveAspectRatio="xMidYMid meet" />

              {/* Head (filled with light gradient to avoid black) */}
              <rect x="60" y="40" width="80" height="70" rx="15" fill="url(#robotGradient)" stroke="#6B7280" strokeWidth="3" />
              
              {/* Eyes (red) */}
              <circle className="fr-eye" cx="80" cy="70" r="8" fill="#B8322C" />
              <circle className="fr-eye" cx="120" cy="70" r="8" fill="#B8322C" />

              {/* Smile */}
              <path d="M 80 90 Q 100 100 120 90" stroke="#6B7280" strokeWidth="3" fill="none" strokeLinecap="round" />

              {/* Body (filled with same light gradient) */}
              <rect x="50" y="120" width="100" height="80" rx="20" fill="url(#robotGradient)" stroke="#6B7280" strokeWidth="3" />
              
              {/* Document in hand */}
              <g className="fr-doc">
                <rect x="80" y="140" width="40" height="50" rx="4" fill="white" stroke="#6B7280" strokeWidth="2" />
                <line x1="85" y1="150" x2="115" y2="150" stroke="#6B7280" strokeWidth="2" />
                <line x1="85" y1="160" x2="115" y2="160" stroke="#6B7280" strokeWidth="2" />
                <line x1="85" y1="170" x2="110" y2="170" stroke="#6B7280" strokeWidth="2" />
              </g>

              {/* Arms */}
              <line className="fr-arm fr-arm-left" x1="50" y1="140" x2="30" y2="160" stroke="#6B7280" strokeWidth="6" strokeLinecap="round" />
              <line className="fr-arm fr-arm-right" x1="150" y1="140" x2="170" y2="160" stroke="#6B7280" strokeWidth="6" strokeLinecap="round" />

              {/* Legs */}
              <rect className="fr-leg fr-leg-left" x="65" y="200" width="25" height="35" rx="8" fill="#6B7280" />
              <rect className="fr-leg fr-leg-right" x="110" y="200" width="25" height="35" rx="8" fill="#6B7280" />

              {/* Gradient Definitions (light / warm so head/body look white-ish) */}
              <defs>
                <linearGradient id="robotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FEF5F4" />
                  <stop offset="100%" stopColor="#FFF7F6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <div className="fr-right">
          <div className="fr-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src="/logo/ajur.png" alt="ajur" style={{ width: 36, height: 36, objectFit: 'contain' }} />
              <h3 className="fr-card-title">ربات آجر به دنبال بهترین گزینه‌هاست</h3>
            </div>
            <p className="fr-card-desc">با ثبت درخواست، ما فایل‌های متناسب با نیازتان را در اولویت قرار می‌دهیم و به محض یافتن، به شما اطلاع می‌دهیم.</p>

            <ul className="fr-features">
              <li>جستجوی هوشمند در تمام فایل‌های موجود</li>
              <li>تطبیق دقیق با نیاز شما</li>
              <li>اعلان آنی فایل‌های جدید</li>
            </ul>

            <div className="fr-ctas">
              <button className="fr-cta primary" onClick={onCallClick || (() => (window.location.href = "tel:+982191000000"))}>📞 تماس با مشاور</button>
              <button className="fr-cta outline" onClick={onActionClick || (() => console.log("ثبت درخواست فایل clicked"))}>📋 ثبت درخواست فایل</button>
            </div>
          </div>
        </div>
      </div>

      <div className="fr-stats">
        <div className="fr-stat"><div className="fr-stat-number">+۱۰۰۰</div><div className="fr-stat-label">فایل بررسی شده امروز</div></div>
        <div className="fr-stat"><div className="fr-stat-number">۲۴/۷</div><div className="fr-stat-label">پشتیبانی شبانه‌روزی</div></div>
        <div className="fr-stat"><div className="fr-stat-number">۹۵٪</div><div className="fr-stat-label">رضایت مشتریان</div></div>
      </div>

      {/* Scoped styles (no framer-motion required) */}
      <style jsx>{`
        @font-face {
          font-family: 'Iran Sans';
          src: url('/fonts/iran-sans.ttf') format('truetype');
          font-weight: 400 900;
          font-style: normal;
          font-display: swap;
        }
        .fr-wrapper { padding: 48px 16px; max-width: 1200px; margin: 0 auto; }
        .fr-header { text-align: center; margin-bottom: 40px; direction: rtl; }
        .fr-header .fr-title { display: block; margin: 0 auto 8px auto; text-align: center; font-size: 34px; font-weight: 800; background: linear-gradient(135deg,#A64B44,#2F2F2F); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-family: 'Iran Sans', sans-serif; }
        .fr-sub { color: #374151; max-width: 720px; margin: 0 auto; text-align: right; direction: rtl; font-family: 'Iran Sans', sans-serif; }

        .fr-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: start; }
        .fr-left { position: relative; height: 400px; display:flex; align-items:center; justify-content:center; }
        .fr-floating {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%,-50%);
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(8px);
          border: 2px solid rgba(107,114,128,0.18);
          border-radius: 12px;
          padding: 12px 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.08);
          min-width: 180px;
          text-align: right;
          direction: rtl;
          animation: frFloat 3s linear infinite;
          /* apply horizontal offset from inline style var --offset */
          transform-origin: center;
          margin: 0;
        }
        .fr-floating { --ox: 0px; }
        /* allow inline style to set --offset via style prop */
        .fr-floating { left: calc(50%); }
        /* Use CSS custom property set inline (React style) */
        .fr-floating { transform: translate(calc(-50% + var(--offset, 0px)), -0%); }

        @keyframes frFloat {
          0% { opacity: 0; transform: translate(calc(-50% + var(--offset,0px)), 0) scale(0.85); }
          10% { opacity: 1; transform: translate(calc(-50% + var(--offset,0px)), -10px) scale(1); }
          70% { opacity: 1; transform: translate(calc(-50% + var(--offset,0px)), -100px) scale(1); }
          100% { opacity: 0; transform: translate(calc(-50% + var(--offset,0px)), -140px) scale(0.8); }
        }

        .fr-file-title { font-size: 14px; font-weight: 700; color: #1F2937; margin-bottom: 4px; }
        .fr-file-meta { font-size: 12px; color: #6B7280; display:flex; justify-content:space-between; }
        .fr-price { color:#374151; font-weight:700; }

        .fr-robot-wrap { display:flex; align-items:center; justify-content:center; width:100%; height:100%; }
        .fr-robot { width: 200px; height: 240px; overflow: visible; animation: frBob 2s ease-in-out infinite; }
        @keyframes frBob { 0% { transform: translateY(0);} 50% { transform: translateY(-12px);} 100% { transform: translateY(0);} }
        .fr-antenna { transform-origin: 100px 40px; animation: frAntenna 2s ease-in-out infinite; }
        @keyframes frAntenna { 0% { transform: rotate(0deg);} 33% { transform: rotate(8deg);} 66% { transform: rotate(-8deg);} 100% { transform: rotate(0deg);} }
        .fr-antenna-dot { animation: frDot 1s infinite; transform-origin: center; }
        @keyframes frDot { 0% { transform: scale(1);} 50% { transform: scale(1.16);} 100% { transform: scale(1);} }
        .fr-doc { transform-origin: 100px 160px; animation: frDoc 1.5s ease-in-out infinite; }
        @keyframes frDoc { 0% { transform: rotate(-5deg);} 50% { transform: rotate(5deg);} 100% { transform: rotate(-5deg);} }
        .fr-arm-left, .fr-arm-right { transform-origin: 50px 140px; animation: frArm 1.5s ease-in-out infinite; }
        .fr-arm-right { animation-direction: reverse; }
        @keyframes frArm { 0% { transform: rotate(-10deg);} 50% { transform: rotate(10deg);} 100% { transform: rotate(-10deg);} }
        .fr-leg-left, .fr-leg-right { animation: frLeg 0.6s ease-in-out infinite; }
        .fr-leg-right { animation-delay: 0.15s; }
        @keyframes frLeg { 0% { transform: translateY(0);} 50% { transform: translateY(5px);} 100% { transform: translateY(0);} }

        .fr-right { display:flex; align-items:flex-start; }
        .fr-card { background: rgba(255,255,255,0.72); backdrop-filter: blur(10px); border-radius: 16px; padding: 20px; box-shadow: 0 16px 40px rgba(0,0,0,0.06); width:100%; }
        .fr-card-title { margin: 0; font-size: 22px; font-weight: 800; color: #111827; font-family: 'Iran Sans', sans-serif; }
        .fr-card-desc { color: #374151; line-height: 1.8; margin-top: 12px; text-align: right; direction: rtl; font-family: 'Iran Sans', sans-serif; }
        .fr-features { margin-top: 12px; padding-right: 18px; color: #374151; list-style: disc; list-style-position: inside; text-align: right; direction: rtl; }
        .fr-features li { margin-bottom: 8px; }
        .fr-ctas { display:flex; gap:12px; margin-top:18px; flex-wrap:wrap; }

        .fr-cta { flex:1; min-width:160px; padding:12px 18px; border-radius:12px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; border:0; transition: transform 160ms ease, box-shadow 160ms ease; }
        .fr-cta.primary { background: linear-gradient(135deg,#16A34A,#059669); color:#fff; box-shadow: 0 8px 26px rgba(5,150,105,0.18); }
        .fr-cta.outline { background: linear-gradient(135deg,#A64B44,#2F2F2F); color: #fff; border: 0; box-shadow: 0 8px 18px rgba(55,65,81,0.12); }

        .fr-cta:hover { transform: translateY(-6px) scale(1.02); }
        .fr-cta:active { transform: translateY(-2px) scale(0.98); }

        .fr-stats { display:flex; gap:12px; margin-top:28px; flex-wrap:wrap; }
        .fr-stat { flex:1 1 220px; background: rgba(255,255,255,0.8); border-radius:12px; padding:14px; text-align:center; border:1px solid rgba(107,114,128,0.12); }
        .fr-stat-number { font-size:22px; font-weight:800; color:#111827; margin-bottom:6px; }
        .fr-stat-label { color:#6B7280; }

        /* RTL support and responsive */
        @media (max-width: 800px) {
          .fr-grid { grid-template-columns: 1fr; }
          .fr-left { height: 320px; }
        }
      `}</style>
    </section>
  );
}
