import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ChevronDown } from "lucide-react"
import { PillLink } from "@/components/pill-button"
import { FAQS } from "@/lib/home-content"
import { FREE_TEST_HREF, whatsappLink } from "@/lib/site-config"

export function FaqSection() {
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 pt-16 sm:px-6 sm:pt-24">
      <h2 className="text-balance text-center font-display text-3xl font-bold sm:text-5xl">
        Frequently asked questions
      </h2>
      <div className="mt-8 flex flex-col gap-3">
        {FAQS.map((item) => (
          <details
            key={item.q}
            className="group rounded-3xl border-2 border-border bg-card px-6 py-4 shadow-soft open:shadow-toy"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold [&::-webkit-details-marker]:hidden">
              {item.q}
              <ChevronDown
                className="h-5 w-5 shrink-0 text-brand transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <p className="mt-3 leading-7 text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

export function FinalCta() {
  const chat = whatsappLink()
  return (
    <section className="mx-auto mt-20 max-w-6xl px-4 sm:mt-28 sm:px-6">
      <div className="relative overflow-hidden rounded-[2.5rem] border-2 border-border bg-card bg-dots px-6 py-14 text-center shadow-soft sm:px-12">
        <div className="mx-auto max-w-2xl">
          <div className="mx-auto h-24 w-24 overflow-hidden rounded-[1.5rem] border-4 border-card shadow-toy">
            <Image src="/login-fox.png" alt="" width={96} height={96} className="h-full w-full object-cover" />
          </div>
          <h2 className="mt-5 text-balance font-display text-3xl font-bold sm:text-5xl">
            Find out where your child really stands in maths, in 15 minutes.
          </h2>
          <div className="mt-7 flex justify-center">
            <PillLink href={FREE_TEST_HREF} variant="sun" size="lg">
              Start the free test
              <ArrowRight className="h-5 w-5" />
            </PillLink>
          </div>
          {chat && (
            <p className="mt-5 text-sm text-muted-foreground">
              Questions?{" "}
              <a
                href={chat}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brand underline-offset-4 hover:underline"
              >
                Chat with us on WhatsApp
              </a>
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

const FOOTER_COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Learn",
    links: [
      { label: "My courses", href: "/learn" },
      { label: "Free maths test", href: FREE_TEST_HREF },
      { label: "Pricing", href: "/pricing" },
      { label: "SIMA Abacus", href: "/sima-abacus" },
    ],
  },
  {
    heading: "Partners",
    links: [
      { label: "For schools", href: "/schools" },
      { label: "For employers", href: "/for-employers" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Sign in", href: "/login" },
      { label: "Create account", href: "/signup" },
    ],
  },
]

export function SiteFooter() {
  const chat = whatsappLink()
  return (
    <footer className="mt-20 bg-ink text-ink-foreground sm:mt-28">
      <div className="mx-auto max-w-6xl px-4 pb-8 pt-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2fr]">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-2.5" aria-label="MatchlessGrade home">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                <Image src="/matchless-grade-logo.png" alt="" width={32} height={32} className="h-8 w-8 object-contain" />
              </span>
              <span className="font-display text-xl font-bold">
                Matchless <span className="text-sun">Grade</span>
              </span>
            </Link>
            <p className="mt-4 text-pretty text-sm leading-6 text-ink-foreground/70">
              Game-based maths from Nursery to SSS3, bundled Primary English classes, and SIMA Abacus mental maths. Monthly plans, cancel any time.
            </p>
            {chat && (
              <a
                href={chat}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-sm font-semibold text-sun underline-offset-4 hover:underline"
              >
                Chat with us on WhatsApp
              </a>
            )}
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.heading}>
                <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink-foreground/60">
                  {column.heading}
                </h2>
                <ul className="mt-4 flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm font-semibold text-ink-foreground/90 underline-offset-4 hover:text-sun hover:underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-ink-foreground/15 pt-6 text-xs text-ink-foreground/60 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} MatchlessGrade. All rights reserved.</p>
          <p className="flex items-center gap-4">
            <Link href="/privacy" className="underline-offset-4 hover:text-ink-foreground hover:underline">Privacy</Link>
            <Link href="/terms" className="underline-offset-4 hover:text-ink-foreground hover:underline">Terms</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
