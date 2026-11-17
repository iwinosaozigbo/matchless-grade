export type SimaAdminLesson = {
  id: string
  week_number: number
  lesson_number: number
  title: string
  summary: string
  video_url: string
  release_at: string
  is_published: boolean
}

export type SimaAdminLearner = {
  userId: string | null
  email: string
  name: string | null
  createdAt: string | null
  hasAccess: boolean
  override: boolean | null
  overrideReason: string | null
  paidAt: string | null
  paidAmountNgn: number
  completedLessons: number
  totalLessonsStarted: number
  latestActivity: string | null
}

export type SimaAdminActivity = {
  id: string
  action: string
  target_email: string
  reason: string
  details: Record<string, unknown>
  created_at: string
}

export type SimaAdminLiveClassLink = {
  cohort_key: string
  join_url: string
  schedule_info: string
  updated_at: string
}

export type AdminPaymentProgramSource = "assigned" | "reference" | "amount" | "unknown"

export type AdminPayment = {
  transactionId: string
  txRef: string
  email: string
  name: string | null
  amountNgn: number
  currency: string
  status: string
  paymentType: string | null
  paidAt: string
  programId: string | null
  programSource: AdminPaymentProgramSource
}

export type SimaAdminDashboardData = {
  payments: AdminPayment[]
  paymentsError: string | null
  summary: {
    learnerCount: number
    paymentCount: number
    revenueNgn: number
    accessGrantedCount: number
    accessRevokedCount: number
    lessonCount: number
    publishedLessonCount: number
    upcomingLessonCount: number
  }
  learners: SimaAdminLearner[]
  lessons: SimaAdminLesson[]
  liveClassLinks: SimaAdminLiveClassLink[]
  activity: SimaAdminActivity[]
}

export type SimaAdminTab = "overview" | "accounts" | "payments" | "learners" | "timetable" | "mathematics" | "liveClasses" | "activity" | "referrals"

export type SimaAdminAccessResult =
  | { status: "authorized"; user: { id: string; email: string } }
  | { status: "sign-in" }
  | { status: "unconfigured" }
  | { status: "forbidden" }

export type SimaAdminActionResponse = { error?: string; ok?: boolean }
