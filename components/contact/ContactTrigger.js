// components/contact/ContactTrigger.js
import { useState } from "react";
import ContactSheet from "./ContactSheet";
import { Phone } from "lucide-react";

/**
 * ContactTrigger
 * Props:
 *  - phone, whatsapp, chatHref (passed to ContactSheet)
 *  - variant: "solid" | "outline" (style preset)
 *  - className: extra classes for button
 *  - ariaLabel: optional aria-label for accessibility
 */
export default function ContactTrigger({
  phone = "",
  whatsapp = "",
  chatHref = "/chat",
  variant = "solid",
  className = "",
  ariaLabel = "باز کردن منوی تماس",
  hideLabel = false,
}) {
  const [open, setOpen] = useState(false);

  const baseClasses =
    "inline-flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm";
  const variants = {
    solid:
      "px-4 py-2 bg-[#a92a21] text-white hover:opacity-95 focus:ring-[#a92a21]/50",
    outline:
      "px-3 py-2 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 focus:ring-gray-300",
  };

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen(true)}
        className={`${baseClasses} ${variants[variant] ?? variants.solid} ${className}`}
      >
        <Phone size={16} />
        {!hideLabel && <span className="font-medium">تماس</span>}
      </button>

      <ContactSheet
        open={open}
        onClose={() => setOpen(false)}
        phone={phone}
        whatsapp={whatsapp}
        chatHref={chatHref}
      />
    </>
  );
}
