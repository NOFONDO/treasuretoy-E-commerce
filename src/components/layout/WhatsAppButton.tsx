import { MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/whatsapp";

export function WhatsAppButton() {
  const url = whatsappUrl("Hello TREASURE_TOYSHOP, I would like to make an enquiry about your products.");
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-medium text-navy shadow-lg transition-transform hover:scale-105"
    >
      <MessageCircle className="size-5" aria-hidden />
      <span className="hidden sm:inline">Chat on WhatsApp</span>
    </a>
  );
}
