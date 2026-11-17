// Every program is a monthly subscription. A successful charge keeps access open for one
// billing month plus a short grace window so a slightly late renewal does not lock learners out.
const GRACE_DAYS = 3

export function nextPeriodEnd(paidAt: string | Date | number = Date.now()): string {
  const start = new Date(paidAt)
  const base = Number.isNaN(start.getTime()) ? new Date() : start
  const end = new Date(base)
  const day = end.getUTCDate()
  end.setUTCMonth(end.getUTCMonth() + 1)
  // Clamp (e.g. Jan 31 + 1 month) so we never roll into the month after next.
  if (end.getUTCDate() !== day) end.setUTCDate(0)
  end.setUTCDate(end.getUTCDate() + GRACE_DAYS)
  return end.toISOString()
}

/** A null period end marks a legacy payment made before subscriptions, which stays active. */
export function isPeriodActive(currentPeriodEnd: string | null | undefined, now: number = Date.now()) {
  if (!currentPeriodEnd) return true
  const end = Date.parse(currentPeriodEnd)
  return Number.isFinite(end) ? end > now : true
}

/** PostgREST `.or()` filter matching rows whose subscription period is still open. */
export function activePeriodFilter(now: number = Date.now()) {
  return `current_period_end.is.null,current_period_end.gt.${new Date(now).toISOString()}`
}
