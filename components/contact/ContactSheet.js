// components/contact/ContactSheet.js
import { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useRouter } from "next/router";

export default function ContactSheet({
  open = false,
  onClose = () => {},
  phone = "",
  chatHref = "/chat",
}) {
  const rootId = "__ajur_contact_sheet_root";
  const sheetRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);
  const prevActiveElRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    let root = document.getElementById(rootId);
    if (!root) {
      root = document.createElement("div");
      root.id = rootId;
      document.body.appendChild(root);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      if (prevActiveElRef.current) {
        try {
          prevActiveElRef.current.focus?.();
        } catch (e) {
          console.error("Focus restore error:", e);
        }
        prevActiveElRef.current = null;
      }
      return;
    }

    prevActiveElRef.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      firstFocusableRef.current?.focus?.();
    }, 50);

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Tab") {
        const focusableElements = sheetRef.current?.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (typeof window === "undefined") return null;
  const root = document.getElementById(rootId);
  if (!root) return null;

  const telHref = phone ? `tel:${phone.replace(/\s+/g, "")}` : "#";
  const waHref = formatWhatsappHref(phone);
  const hasPhone = Boolean(phone && phone.trim());

  function goToChat() {
    router.push("/chat");
    onClose();
  }

  // helper: safe img element with fallback to inline svg if 404
  function IconImg({ src, alt, className = "w-8 h-8" }) {
    // data-attr used to identify failed images in console if needed
    return (
      <img
        src={src}
        alt={alt}
        className={className + " object-contain"}
        onError={(e) => {
          // replace broken image with inline SVG fallback
          const parent = e.currentTarget.parentElement;
          if (!parent) return;
          const wrapper = document.createElement("span");
          wrapper.setAttribute("aria-hidden", "true");
          wrapper.style.display = "inline-flex";
          wrapper.style.width = "20px";
          wrapper.style.height = "20px";
          wrapper.style.alignItems = "center";
          wrapper.style.justifyContent = "center";
          wrapper.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="4" fill="#E5E7EB"/>
              <path d="M8 12.5l2.5 3 4.5-6" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          `;
          // replace img element
          parent.replaceChild(wrapper, e.currentTarget);
          console.warn("Image failed to load, replaced with fallback SVG:", src);
        }}
        loading="lazy"
      />
    );
  }

  return ReactDOM.createPortal(
    <>
      <div
        aria-hidden={!open}
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="انتخاب روش تماس"
        className={`fixed left-0 right-0 bottom-0 z-50 transform transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="max-w-2xl mx-auto bg-white rounded-t-2xl shadow-xl p-4 pb-6">
          <div className="text-center mb-2">
            <h3 className="text-gray-900 text-lg">انتخاب روش تماس</h3>
            <p className="text-sm text-gray-500">یکی از گزینه‌های زیر را انتخاب کنید</p>
          </div>

          <div className="flex flex-col gap-3 mt-3">
            {/* Phone Call */}
            <a
              ref={firstFocusableRef}
              href={telHref}
              onClick={onClose}
              className={`flex items-center justify-between gap-3 w-full py-3 px-4 rounded-lg border transition text-right ${
                hasPhone ? "border-gray-200 hover:bg-gray-50 cursor-pointer" : "border-gray-100 bg-gray-50 cursor-not-allowed"
              }`}
              aria-disabled={!hasPhone}
            >
              <div className="flex items-center ltr:mr-3 rtl:ml-3">
                <IconImg src="/chat-icons/phone-call0.png" alt="تماس تلفنی" />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-gray-900 text-lg">تماس تلفنی</span>
                {hasPhone ? (
                  <span className="text-xs text-gray-500 mt-1">{phone}</span>
                ) : (
                  <span className="text-xs text-gray-400 mt-1">شماره تماس موجود نیست</span>
                )}
              </div>
            </a>

            {/* Internal Chat */}
            <a
              className="flex items-center justify-between gap-3 w-full py-3 px-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition text-right cursor-pointer"
              onClick={goToChat}
            >
              <div className="flex items-center ltr:mr-3 rtl:ml-3">
                <IconImg src="/chat-icons/ajur-chat.png" alt="پیام در آجر" />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-gray-900 text-lg">پیام در آجر</span>
              </div>
            </a>

            {/* WhatsApp */}
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className={`flex items-center justify-between gap-3 w-full py-3 px-4 rounded-lg border transition text-right ${
                hasPhone ? "border-gray-200 hover:bg-gray-50 cursor-pointer" : "border-gray-100 bg-gray-50 cursor-not-allowed"
              }`}
              aria-disabled={!hasPhone}
            >
              <div className="flex items-center ltr:mr-3 rtl:ml-3">
                <IconImg src="/chat-icons/whatsapp-chat.png" alt="پیام در واتساپ" />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-gray-900 text-lg">پیام در واتساپ</span>
              </div>
            </a>

            <button
              ref={lastFocusableRef}
              onClick={onClose}
              className="w-full mt-1 py-3 px-4 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-medium"
            >
              انصراف
            </button>
          </div>
        </div>
      </div>
    </>,
    root
  );
}

function formatWhatsappHref(phone) {
  if (!phone) return "#";
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "#";
  if (/^0/.test(digits)) return `https://wa.me/98${digits.replace(/^0+/, "")}`;
  if (/^9\d{9}$/.test(digits)) return `https://wa.me/98${digits}`;
  if (/^98\d+/.test(digits)) return `https://wa.me/${digits}`;
  return `https://wa.me/${digits}`;
}
