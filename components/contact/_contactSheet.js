import { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import Link from "next/link";
import { useRouter } from "next/router"; // Import Next.js router

import { Phone, MessageSquare, ExternalLink } from "lucide-react";

/**
 * ContactSheet Component
 * Props:
 *  - open: boolean (controls visibility)
 *  - onClose: () => void (close handler)
 *  - phone: string (used for both phone calls and WhatsApp)
 *  - chatHref: string (internal chat route)
 */
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

  // Create portal root if needed
  useEffect(() => {
    let root = document.getElementById(rootId);
    if (!root) {
      root = document.createElement("div");
      root.id = rootId;
      document.body.appendChild(root);
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Lock scroll & manage focus when open
  useEffect(() => {
    if (!open) {
      // Restore scroll and focus
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

    // Save previous active element
    prevActiveElRef.current = document.activeElement;

    // Lock body scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus the first focusable element after a tick
    const timer = setTimeout(() => {
      firstFocusableRef.current?.focus?.();
    }, 50);

    // Keydown handler for Escape and Tab trapping
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Tab") {
        // Focus trap
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

  // Don't render on server
  if (typeof window === "undefined") return null;

  const root = document.getElementById(rootId);
  if (!root) return null;

  // Generate contact URLs
  const telHref = phone ? `tel:${phone.replace(/\s+/g, "")}` : "#";
  const waHref = formatWhatsappHref(phone);
  const waLabel = formatWhatsappLabel(phone);
  const hasPhone = Boolean(phone && phone.trim());

  function goToChat() {
    router.push("/chat");
    onClose();
  }

  return ReactDOM.createPortal(
    <>
      {/* Backdrop */}
      <div
        aria-hidden={!open}
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sheet */}
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
          {/* <-- Grab handle removed to make it simple and just slide up --> */}

          {/* Header */}
          <div className="text-center mb-2">
            <h3 className="text-gray-900  text-lg">انتخاب روش تماس</h3>
            <p className="text-sm text-gray-500">
              یکی از گزینه‌های زیر را انتخاب کنید
            </p>
          </div>

          {/* Contact Options */}
          <div className="flex flex-col gap-3 mt-3">
            {/* Phone Call */}
            <a
              ref={firstFocusableRef}
              href={telHref}
              onClick={onClose}
              className={`flex items-center justify-between gap-3 w-full py-3 px-4 rounded-lg border transition text-right ${
                hasPhone
                  ? "border-gray-200 hover:bg-gray-50 cursor-pointer"
                  : "border-gray-100 bg-gray-50 cursor-not-allowed"
              }`}
              aria-disabled={!hasPhone}
            >
              <Phone
                size={22}
                className={hasPhone ? "text-gray-600" : "text-gray-400"}
              />
              <div className="flex flex-col items-end">
                <span className="text-gray-900  text-lg">تماس تلفنی</span>
                {hasPhone ? (
                  <span className="text-xs text-gray-500 mt-1">{phone}</span>
                ) : (
                  <span className="text-xs text-gray-400 mt-1">
                    شماره تماس موجود نیست
                  </span>
                )}
              </div>
            </a>

            {/* Internal Chat */}
            <a
              className="flex items-center justify-between gap-3 w-full py-3 px-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition text-right cursor-pointer"
              onClick={goToChat}
            >
              <MessageSquare size={18} className="text-gray-600" />
              <div className="flex flex-col items-end">
                <span className="text-gray-900  text-lg">پیام در آجر</span>
              </div>
            </a>

            {/* WhatsApp */}
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className={`flex items-center justify-between gap-3 w-full py-3 px-4 rounded-lg border transition text-right ${
                hasPhone
                  ? "border-gray-200 hover:bg-gray-50 cursor-pointer"
                  : "border-gray-100 bg-gray-50 cursor-not-allowed"
              }`}
              aria-disabled={!hasPhone}
            >
              <ExternalLink
                size={22}
                className={hasPhone ? "text-gray-600" : "text-gray-400"}
              />
              <div className="flex flex-col items-end">
                <span className="text-gray-900  text-lg">پیام در واتساپ</span>
              </div>
            </a>

            {/* Cancel Button */}
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

/**
 * Format phone number for WhatsApp URL
 */
function formatWhatsappHref(phone) {
  if (!phone) return "#";

  const digits = phone.replace(/\D/g, "");
  if (!digits) return "#";

  // If starts with 0 -> replace with 98
  if (/^0/.test(digits)) {
    return `https://wa.me/98${digits.replace(/^0+/, "")}`;
  }

  // If starts with 9 and length 10 (like 912...) -> assume Iran
  if (/^9\d{9}$/.test(digits)) {
    return `https://wa.me/98${digits}`;
  }

  // If starts with 98 already
  if (/^98\d+/.test(digits)) {
    return `https://wa.me/${digits}`;
  }

  // Fallback
  return `https://wa.me/${digits}`;
}

/**
 * Format phone number for display label
 */
function formatWhatsappLabel(phone) {
  if (!phone) return "";

  const digits = phone.replace(/\D/g, "");
  if (!digits) return phone;

  if (/^0/.test(digits)) {
    return "+98" + digits.replace(/^0+/, "");
  }

  if (/^98/.test(digits)) {
    return "+" + digits;
  }

  if (/^9\d{9}$/.test(digits)) {
    return "+98" + digits;
  }

  return "+" + digits;
}
