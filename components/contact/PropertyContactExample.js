// components/contact/PropertyContactExample.js
import ContactTrigger from "./ContactTrigger";

/**
 * PropertyContactExample
 * یک مثال ساده برای تست و جایگذاری در صفحات جزئیات ملک یا کارت‌های ملک
 * props:
 *  - propertyId (string|number) برای نمونه‌سازی chatHref
 *  - ownerPhone, ownerWhatsapp
 */
export default function PropertyContactExample({
  propertyId = "123",
  ownerPhone = "09121234567",
  ownerWhatsapp = "9121234567",
}) {
  const chatHref = `/chat/rooms/property-${propertyId}`; // نمونه؛ با مسیر واقعی خودتان جایگزین کنید

  return (
    <div className="p-4 border rounded-md max-w-md bg-white">
      <div className="flex items-center justify-between">
        <div className="text-right">
          <div className="text-sm text-gray-500">تماس با آگهی‌دهنده</div>
          <div className="text-base font-semibold text-gray-800">پاسخ‌گوی آجر</div>
        </div>

        <ContactTrigger
          phone={ownerPhone}
          whatsapp={ownerWhatsapp}
          chatHref={chatHref}
          variant="solid"
        />
      </div>
    </div>
  );
}
