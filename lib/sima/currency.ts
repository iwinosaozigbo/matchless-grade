import "server-only"

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto"
import countryToCurrency from "country-to-currency"
import { getProgram, getProgramPriceNgn } from "@/lib/program-pricing"

const RATE_URLS = [
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/ngn.json",
  "https://latest.currency-api.pages.dev/v1/currencies/ngn.json",
]
const QUOTE_PREFIX = "sp-sima-abacus-"
const QUOTE_TTL_MS = 24 * 60 * 60 * 1000

type ExchangeRates = { date?: string; ngn?: Record<string, number> }
type SignedSimaQuote = {
  version: 1
  productId: "sima-abacus"
  amountNgn: number
  amount: number
  currency: string
  countryCode: string
  issuedAt: number
  nonce: string
}

export type LocalizedSimaPrice = {
  amountNgn: number
  amount: number
  currency: string
  countryCode: string
  formatted: string
  rateDate: string | null
}

export function getSimaCountryCode(countryHeader: string | null, acceptLanguage: string | null): string {
  const country = countryHeader?.trim().toUpperCase()
  if (country && Object.hasOwn(countryToCurrency, country)) return country

  for (const entry of acceptLanguage?.split(",") ?? []) {
    const localeTag = entry.split(";")[0].trim()
    if (!localeTag) continue
    try {
      const region = new Intl.Locale(localeTag).region
      if (region && Object.hasOwn(countryToCurrency, region)) return region
    } catch {
      continue
    }
  }

  return "NG"
}

function currencyForCountry(countryCode: string) {
  return (countryToCurrency as Record<string, string>)[countryCode] ?? "NGN"
}

function currencyLocale(countryCode: string) {
  try {
    return new Intl.Locale("en", { region: countryCode }).toString()
  } catch {
    return "en"
  }
}

function formatCurrency(amount: number, currency: string, countryCode: string) {
  return new Intl.NumberFormat(currencyLocale(countryCode), {
    style: "currency",
    currency,
    maximumFractionDigits: new Intl.NumberFormat("en", { style: "currency", currency }).resolvedOptions().maximumFractionDigits,
  }).format(amount)
}

async function loadExchangeRates(): Promise<ExchangeRates> {
  for (const url of RATE_URLS) {
    try {
      const response = await fetch(url, {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(8000),
      })
      if (!response.ok) continue
      const data = (await response.json()) as ExchangeRates
      const rateDate = data.date ? Date.parse(`${data.date}T23:59:59Z`) : Number.NaN
      if (
        !data.ngn ||
        !Number.isFinite(rateDate) ||
        Date.now() - rateDate > 48 * 60 * 60 * 1000 ||
        rateDate - Date.now() > 24 * 60 * 60 * 1000
      ) continue
      return data
    } catch {
      continue
    }
  }

  throw new Error("Current currency conversion rates are unavailable.")
}

async function convertSimaPrice(amountNgn: number, countryCode: string): Promise<LocalizedSimaPrice> {
  const currency = currencyForCountry(countryCode)
  if (currency === "NGN") {
    return {
      amountNgn,
      amount: amountNgn,
      currency,
      countryCode,
      formatted: formatCurrency(amountNgn, currency, countryCode),
      rateDate: null,
    }
  }

  const rates = await loadExchangeRates()
  const rate = rates.ngn?.[currency.toLowerCase()]
  if (typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0) {
    throw new Error(`A conversion rate for ${currency} is unavailable.`)
  }

  const fractionDigits = new Intl.NumberFormat("en", { style: "currency", currency }).resolvedOptions().maximumFractionDigits ?? 2
  const precision = 10 ** fractionDigits
  const amount = Math.round((amountNgn * rate + Number.EPSILON) * precision) / precision
  return {
    amountNgn,
    amount,
    currency,
    countryCode,
    formatted: formatCurrency(amount, currency, countryCode),
    rateDate: rates.date ?? null,
  }
}

export async function getLocalizedSimaPrice(
  amountNgn: number,
  countryHeader: string | null,
  acceptLanguage: string | null,
): Promise<LocalizedSimaPrice> {
  const countryCode = getSimaCountryCode(countryHeader, acceptLanguage)
  try {
    return await convertSimaPrice(amountNgn, countryCode)
  } catch {
    return {
      amountNgn,
      amount: amountNgn,
      currency: "NGN",
      countryCode: "NG",
      formatted: formatCurrency(amountNgn, "NGN", "NG"),
      rateDate: null,
    }
  }
}

export async function createSimaPaymentQuote(countryHeader: string | null, acceptLanguage: string | null) {
  const countryCode = getSimaCountryCode(countryHeader, acceptLanguage)
  const program = getProgram("sima-abacus")!
  const issuedAt = Date.now()
  const amountNgn = getProgramPriceNgn(program, issuedAt)
  const localized = await convertSimaPrice(amountNgn, countryCode)
  const secret = process.env.FLUTTERWAVE_SECRET_KEY?.trim()
  if (!secret) throw new Error("Secure checkout is not configured.")

  const quote: SignedSimaQuote = {
    version: 1,
    productId: "sima-abacus",
    amountNgn,
    amount: localized.amount,
    currency: localized.currency,
    countryCode,
    issuedAt,
    nonce: randomBytes(12).toString("base64url"),
  }
  const encoded = Buffer.from(JSON.stringify(quote)).toString("base64url")
  const signature = createHmac("sha256", secret).update(encoded).digest("base64url")

  return { ...localized, txRef: `${QUOTE_PREFIX}${encoded}.${signature}` }
}

export function verifySimaPaymentQuote(txRef: string, now = Date.now()): SignedSimaQuote | null {
  const secret = process.env.FLUTTERWAVE_SECRET_KEY?.trim()
  if (!secret || !txRef.startsWith(QUOTE_PREFIX)) return null

  const token = txRef.slice(QUOTE_PREFIX.length)
  const separator = token.lastIndexOf(".")
  if (separator < 1) return null

  const encoded = token.slice(0, separator)
  const signature = token.slice(separator + 1)
  const expected = createHmac("sha256", secret).update(encoded).digest()
  const supplied = Buffer.from(signature, "base64url")
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null

  try {
    const quote = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SignedSimaQuote
    const countryCode = quote.countryCode.toUpperCase()
    const program = getProgram("sima-abacus")!
    if (
      quote.version !== 1 ||
      quote.productId !== "sima-abacus" ||
      !Number.isSafeInteger(quote.issuedAt) ||
      quote.issuedAt > now + 60_000 ||
      now - quote.issuedAt > QUOTE_TTL_MS ||
      quote.amountNgn !== getProgramPriceNgn(program, quote.issuedAt) ||
      !Number.isFinite(quote.amount) ||
      quote.amount <= 0 ||
      !/^[A-Z]{3}$/.test(quote.currency) ||
      !Object.hasOwn(countryToCurrency, countryCode) ||
      currencyForCountry(countryCode) !== quote.currency ||
      typeof quote.nonce !== "string" ||
      quote.nonce.length < 8
    ) return null
    return quote
  } catch {
    return null
  }
}

export function getSimaBasePriceNgn() {
  return getProgramPriceNgn(getProgram("sima-abacus")!, Date.now())
}

export function formatSimaCurrency(amount: number, currency: string, countryCode: string) {
  return formatCurrency(amount, currency, countryCode)
}

export function getSimaPriceFallback(amountNgn: number) {
  return formatCurrency(amountNgn, "NGN", "NG")
}

export type VerifiedSimaPaymentQuote = ReturnType<typeof verifySimaPaymentQuote>

export function getSimaQuoteExpiryMs() {
  return QUOTE_TTL_MS
}

export function getSimaQuoteReferencePrefix() {
  return QUOTE_PREFIX
}

export function getSimaCurrencyCode(countryCode: string) {
  return currencyForCountry(countryCode)
}

export function getSimaExchangeRateDate(price: LocalizedSimaPrice) {
  return price.rateDate
}

export function isSimaCurrencySupported(currency: string) {
  return /^[A-Z]{3}$/.test(currency)
}

export function normalizeSimaCountryCode(countryCode: string) {
  return Object.hasOwn(countryToCurrency, countryCode.toUpperCase()) ? countryCode.toUpperCase() : "NG"
}

export function getSimaCurrencyPrecision(currency: string) {
  return new Intl.NumberFormat("en", { style: "currency", currency }).resolvedOptions().maximumFractionDigits
}

export function getSimaCurrencyRate(amountNgn: number, amount: number) {
  return amountNgn > 0 ? amount / amountNgn : 0
}

export function roundSimaCurrencyAmount(amount: number, currency: string) {
  const precision = 10 ** (getSimaCurrencyPrecision(currency) ?? 2)
  return Math.round((amount + Number.EPSILON) * precision) / precision
}

export function isSimaCurrencyAmountValid(amount: number, currency: string) {
  return Number.isFinite(amount) && amount > 0 && roundSimaCurrencyAmount(amount, currency) === amount
}

export function isSimaQuoteRecent(issuedAt: number, now = Date.now()) {
  return Number.isSafeInteger(issuedAt) && issuedAt <= now + 60_000 && now - issuedAt <= QUOTE_TTL_MS
}

export function isSimaCountryCode(value: string) {
  return Object.hasOwn(countryToCurrency, value.toUpperCase())
}

export function getSimaSignedQuoteSecretIsConfigured() {
  return Boolean(process.env.FLUTTERWAVE_SECRET_KEY?.trim())
}

export function getSimaPaymentQuoteTtlMs() {
  return QUOTE_TTL_MS
}

export function getSimaQuoteProductId() {
  return "sima-abacus" as const
}

export function getSimaQuoteVersion() {
  return 1 as const
}

export function getSimaQuoteFormat(amount: number, currency: string, countryCode: string) {
  return formatCurrency(amount, currency, countryCode)
}

export function isSimaPaymentQuote(value: unknown): value is SignedSimaQuote {
  return Boolean(value && typeof value === "object" && (value as SignedSimaQuote).productId === "sima-abacus")
}

export function getSimaBaseCurrency() {
  return "NGN" as const
}

export function getSimaPaymentQuoteSignature(encoded: string) {
  const secret = process.env.FLUTTERWAVE_SECRET_KEY?.trim()
  if (!secret) throw new Error("Secure checkout is not configured.")
  return createHmac("sha256", secret).update(encoded).digest("base64url")
}

export function verifySimaQuoteSignature(encoded: string, signature: string) {
  const secret = process.env.FLUTTERWAVE_SECRET_KEY?.trim()
  if (!secret) return false
  const expected = createHmac("sha256", secret).update(encoded).digest()
  const supplied = Buffer.from(signature, "base64url")
  return expected.length === supplied.length && timingSafeEqual(expected, supplied)
}

export function createSimaQuoteNonce() {
  return randomBytes(12).toString("base64url")
}

export function getSimaPriceRateSource() {
  return "Daily currency-api rates" as const
}

export function getSimaRateFreshnessHours() {
  return 48
}

export function getSimaRateCacheSeconds() {
  return 3600
}

export function isSimaRateDateFresh(rateDate: string, now = Date.now()) {
  const timestamp = Date.parse(`${rateDate}T23:59:59Z`)
  return Number.isFinite(timestamp) && now - timestamp <= 48 * 60 * 60 * 1000 && timestamp - now <= 24 * 60 * 60 * 1000
}

export function getSimaQuoteIssuedAt(quote: SignedSimaQuote) {
  return quote.issuedAt
}

export function getSimaQuoteAmount(quote: SignedSimaQuote) {
  return quote.amount
}

export function getSimaQuoteAmountNgn(quote: SignedSimaQuote) {
  return quote.amountNgn
}

export function getSimaQuoteCurrency(quote: SignedSimaQuote) {
  return quote.currency
}

export function getSimaQuoteCountryCode(quote: SignedSimaQuote) {
  return quote.countryCode
}

export function getSimaQuoteNonce(quote: SignedSimaQuote) {
  return quote.nonce
}

export function getSimaQuoteVersionValue(quote: SignedSimaQuote) {
  return quote.version
}

export function getSimaQuoteProductIdValue(quote: SignedSimaQuote) {
  return quote.productId
}

export function getSimaQuoteValue(quote: SignedSimaQuote) {
  return quote
}

export function getSimaQuoteCurrencyMatchesCountry(quote: SignedSimaQuote) {
  return currencyForCountry(quote.countryCode) === quote.currency
}

export function getSimaQuotePriceMatchesProgram(quote: SignedSimaQuote) {
  return quote.amountNgn === getProgramPriceNgn(getProgram("sima-abacus")!, quote.issuedAt)
}

export function isSimaQuoteExpired(quote: SignedSimaQuote, now = Date.now()) {
  return now - quote.issuedAt > QUOTE_TTL_MS
}

export function getSimaLocalCurrencyForCountry(countryCode: string) {
  return currencyForCountry(countryCode.toUpperCase())
}

export function isSimaCountryKnown(countryCode: string) {
  return Object.hasOwn(countryToCurrency, countryCode.toUpperCase())
}

export function getSimaPriceLabel(price: LocalizedSimaPrice) {
  return price.formatted
}

export function getSimaQuotedAmount(price: LocalizedSimaPrice) {
  return price.amount
}

export function getSimaQuotedCurrency(price: LocalizedSimaPrice) {
  return price.currency
}

export function getSimaQuotedCountry(price: LocalizedSimaPrice) {
  return price.countryCode
}

export function getSimaQuotedBaseAmount(price: LocalizedSimaPrice) {
  return price.amountNgn
}

export function getSimaQuoteRateDate(price: LocalizedSimaPrice) {
  return price.rateDate
}

export function getSimaCountryCurrency(countryCode: string) {
  return currencyForCountry(countryCode.toUpperCase())
}

export function isSimaProgramPriceValid(amountNgn: number) {
  return Number.isFinite(amountNgn) && amountNgn > 0
}
