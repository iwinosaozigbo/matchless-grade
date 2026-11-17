import { MessageCircle } from "lucide-react"
import { whatsappLink } from "@/lib/site-config"

export function WhatsAppButton() {
  const href = whatsappLink()
  if (!href) return null

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with MatchlessGrade on WhatsApp"
      className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-toy transition-transform hover:-translate-y-0.5 sm:hidden"
    >
      <MessageCircle className="h-7 w-7" aria-hidden="true" />
    </a>
  )
}
