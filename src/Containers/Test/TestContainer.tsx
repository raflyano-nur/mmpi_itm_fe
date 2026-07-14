import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  HiArrowLeft,
  HiArrowRight,
  HiCheckCircle,
  HiClock,
  HiExclamationTriangle,
} from 'react-icons/hi2'
import AppLayout from '@/Components/Layout/AppLayout'
import { useSessionUser } from '@/Hooks/useSessionUser'
import { useGetAnswersQuery, useSubmitAnswersMutation } from '@/Services/Modules/answers'
import type { SubmitAnswerMap, TestAnswerValue } from '@/Services/Modules/answers'
import {
  useGetTestQuestionsQuery,
  useGetTestProgressQuery,
  useSaveTestProgressMutation,
} from '@/Services/Modules/test'
import { joinClassNames } from '@/Utils/laboratorium'

const TOTAL_QUESTIONS = 567
const TOTAL_PAGES = 3
const PAGE_RANGES: Record<number, { start: number; end: number }> = {
  1: { start: 1, end: 200 },
  2: { start: 201, end: 400 },
  3: { start: 401, end: 567 },
}

const getPageRange = (page: number) => PAGE_RANGES[page] ?? PAGE_RANGES[1]

const normalizeAnswerValue = (value: unknown): TestAnswerValue => {
  if (value === 1 || value === '1') return 1
  if (value === 2 || value === '2') return 2
  if (value === 0 || value === '0') return 0
  return null
}

const countAnswered = (answers: SubmitAnswerMap) =>
  Object.values(answers).filter((value) => value === 1 || value === 2).length

const TestContainer: React.FC = () => {
  const params = useParams()
  const navigate = useNavigate()
  const session = useSessionUser()
  const routeUserId = params.userId
  const userId = routeUserId ?? session.id
  const currentPage = Math.min(Math.max(Number(params.page ?? 1) || 1, 1), TOTAL_PAGES)
  const storageKey = userId ? `mmpi2_answers_${userId}` : ''

  const { data: answersData, isFetching: isFetchingAnswers } = useGetAnswersQuery(userId ?? '', {
    skip: !userId,
  })
  const { data: questionsData, isFetching: isFetchingQuestions } = useGetTestQuestionsQuery(currentPage, {
    skip: !userId,
  })
  const { data: progressData, isFetching: isFetchingProgress } = useGetTestProgressQuery(undefined, {
    skip: !userId,
  })
  const [saveTestProgress] = useSaveTestProgressMutation()
  const [submitAnswers, { isLoading: isSubmitting }] = useSubmitAnswersMutation()

  const [answers, setAnswers] = useState<SubmitAnswerMap>({})
  const [warning, setWarning] = useState<string | null>(null)
  const [hasHydrated, setHasHydrated] = useState(false)

  const answersRef = useRef<SubmitAnswerMap>({})
  const dirtyRef = useRef<SubmitAnswerMap>({}) // jawaban yang belum ter-sync ke server
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const bottomBarRef = useRef<HTMLDivElement>(null)
  const [bottomBarHeight, setBottomBarHeight] = useState(96) // fallback

  useEffect(() => {
    const el = bottomBarRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      setBottomBarHeight(entries[0].contentRect.height)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  const questions = useMemo(() => questionsData?.data?.questions ?? [], [questionsData])
  const answeredCount = countAnswered(answers)
  const progress = Math.round((answeredCount / TOTAL_QUESTIONS) * 100)
  const currentPageAnswered = questions.filter((question) => {
    const answer = answers[String(question.id)]
    return answer === 1 || answer === 2
  }).length

  useEffect(() => {
    if (params.page && Number(params.page) !== currentPage) {
      navigate(`/test/${userId}/${currentPage}`, { replace: true })
    }
  }, [currentPage, navigate, params.page, userId])

  // Hydrate jawaban: progress cache server > jawaban tersimpan permanen > localStorage (fallback)
  useEffect(() => {
    if (!userId || hasHydrated) return
    if (isFetchingAnswers || isFetchingProgress) return

    const savedAnswers = answersData?.data?.answers ?? {}
    const progressAnswers = progressData?.data?.answers ?? {}

    const nextAnswers: SubmitAnswerMap = {}
    for (let questionNo = 1; questionNo <= TOTAL_QUESTIONS; questionNo += 1) {
      const key = String(questionNo)
      nextAnswers[key] = normalizeAnswerValue(savedAnswers[key])
    }
    Object.entries(progressAnswers).forEach(([key, value]) => {
      nextAnswers[key] = normalizeAnswerValue(value)
    })

    const saved = storageKey ? localStorage.getItem(storageKey) : null
    if (saved) {
      try {
        const localAnswers = JSON.parse(saved) as Record<string, unknown>
        Object.entries(localAnswers).forEach(([key, value]) => {
          if (nextAnswers[key] == null) {
            nextAnswers[key] = normalizeAnswerValue(value)
          }
        })
      } catch {
        localStorage.removeItem(storageKey)
      }
    }

    setAnswers(nextAnswers)
    setHasHydrated(true)
  }, [answersData, progressData, isFetchingAnswers, isFetchingProgress, hasHydrated, storageKey, userId])

  // localStorage selalu ditulis ulang tiap answers berubah (fallback offline / cross-refresh instan)
  useEffect(() => {
    if (!storageKey || Object.keys(answers).length === 0) return
    localStorage.setItem(storageKey, JSON.stringify(answers))
  }, [answers, storageKey])

  // Kirim jawaban yang "dirty" (belum ter-sync) ke server
  const flushDirtyToServer = useCallback(
    async (useBeacon = false) => {
      const dirty = dirtyRef.current
      const keys = Object.keys(dirty)
      if (keys.length === 0) return

      const payloadAnswers: SubmitAnswerMap = { ...dirty }
      dirtyRef.current = {}

      if (useBeacon && navigator.sendBeacon) {
        try {
          const blob = new Blob([JSON.stringify({ answers: payloadAnswers })], {
            type: 'application/json',
          })
          const sent = navigator.sendBeacon('/api/test/progress', blob)
          if (sent) return
        } catch {
          // fall through ke fetch biasa kalau sendBeacon gagal
        }
      }

      try {
        await saveTestProgress({ answers: payloadAnswers }).unwrap()
      } catch {
        // gagal kirim: kembalikan ke dirty supaya dicoba lagi nanti
        dirtyRef.current = { ...payloadAnswers, ...dirtyRef.current }
      }
    },
    [saveTestProgress],
  )

  const setAnswer = (questionId: number, value: 1 | 2) => {
    setWarning(null)
    const key = String(questionId)
    setAnswers((prev) => ({ ...prev, [key]: value }))
    dirtyRef.current[key] = value

    // Debounce: kirim ke server 800ms setelah user berhenti menjawab
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      flushDirtyToServer()
    }, 800)
  }

  // Auto-save tiap 10 detik, persis seperti setInterval di versi Flask
  useEffect(() => {
    const interval = setInterval(() => {
      flushDirtyToServer()
    }, 10000)
    return () => clearInterval(interval)
  }, [flushDirtyToServer])

  // Simpan saat tab/browser ditutup, pakai sendBeacon supaya tetap terkirim
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(answersRef.current))
      }
      flushDirtyToServer(true)
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handleBeforeUnload)
    }
  }, [flushDirtyToServer, storageKey])

  const goToPage = async (page: number) => {
    if (!userId) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    await flushDirtyToServer()
    navigate(`/test/${userId}/${page}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFinish = async () => {
    if (!userId) return

    const firstUnanswered = Array.from({ length: TOTAL_QUESTIONS }, (_, index) => index + 1).find((questionNo) => {
      const value = answers[String(questionNo)]
      return value !== 1 && value !== 2
    })

    if (firstUnanswered) {
      const targetPage = firstUnanswered <= 200 ? 1 : firstUnanswered <= 400 ? 2 : 3
      setWarning(`Masih ada soal yang belum dijawab. Mulai dari nomor ${firstUnanswered}.`)
      await flushDirtyToServer()
      goToPage(targetPage)
      return
    }

    try {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      await flushDirtyToServer()

      const response = await submitAnswers({
        user_id: userId,
        answers,
        meta: {
          user_id: userId,
          TestSetting: answersData?.data?.test?.test_setting ?? 'Tes Psikologi MMPI-2',
        },
      }).unwrap()

      if (storageKey) localStorage.removeItem(storageKey)
      setWarning(response.message || 'Jawaban berhasil dikirim.')
      navigate('/dashboard')
    } catch (error: any) {
      setWarning(error?.data?.message || 'Gagal mengirim jawaban. Silakan coba lagi.')
    }
  }

  if (!userId) {
    return (
      <AppLayout title="Tes MMPI-2" subtitle="Memuat data peserta">
        <div className="p-6">
          <div className="mx-auto max-w-3xl rounded-3xl border border-neutral-100 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-neutral-500">
              Session peserta belum siap. Silakan login ulang bila halaman ini tidak berubah.
            </p>
          </div>
        </div>
      </AppLayout>
    )
  }

  const member = answersData?.data?.member
  const pageRange = getPageRange(currentPage)
  const isPageLoading = isFetchingQuestions || !hasHydrated

  return (
    <AppLayout title="Tes MMPI-2" subtitle="Jawab dengan tenang dan jujur sesuai kondisi Anda.">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-emerald-50/50 p-4 pb-40 md:p-6">
        <div className="mx-auto max-w-5xl space-y-5">
          <section className="overflow-hidden rounded-3xl border border-white/70 bg-white shadow-sm">
            <div className="relative isolate p-5 md:p-7">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.14),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.16),_transparent_30%)]" />
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                    Soal MMPI-2
                  </p>
                  <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                    {member?.Name || session.name || 'Peserta'}
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    ID: {userId} | Halaman {currentPage} dari {TOTAL_PAGES} | Soal {pageRange.start}-
                    {pageRange.end}
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-white/80 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-sm font-bold text-white">
                      {progress}%
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {answeredCount} / {TOTAL_QUESTIONS} terjawab
                      </p>
                      <p className="text-xs text-slate-500">
                        Halaman ini: {currentPageAnswered} / {questions.length || pageRange.end - pageRange.start + 1}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {warning && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <HiExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{warning}</span>
            </div>
          )}

          {isPageLoading ? (
            <div className="grid gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-2xl border border-slate-200 bg-white" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 pb-6">
              {questions.map((question) => {
                const selected = answers[String(question.id)]
                return (
                  <article
                    key={question.id}
                    className={joinClassNames(
                      'rounded-2xl border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md md:p-5',
                      selected === 1 || selected === 2 ? 'border-blue-100' : 'border-slate-200',
                    )}
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-700">
                          {question.id}
                        </span>
                        <p className="pt-1 text-sm font-medium leading-6 text-slate-800 md:text-base">
                          {question.text}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 md:w-56">
                        {[
                          { label: 'YA', value: 1 as const },
                          { label: 'TIDAK', value: 2 as const },
                        ].map((option) => {
                          const isSelected = selected === option.value
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setAnswer(question.id, option.value)}
                              className={joinClassNames(
                                'rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all',
                                isSelected
                                  ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                                  : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50',
                              )}
                            >
                              {option.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>

        <div ref={bottomBarRef}
className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/90 px-4 py-3 shadow-2xl backdrop-blur"
style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
>
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <button
              type="button"
              disabled={currentPage === 1 || isSubmitting}
              onClick={() => goToPage(currentPage - 1)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <HiArrowLeft className="h-4 w-4" />
              Prev
            </button>

            <div className="hidden items-center gap-2 text-xs font-medium text-slate-500 sm:flex">
              <HiClock className="h-4 w-4" />
              {isFetchingAnswers || isFetchingProgress ? 'Memuat jawaban tersimpan...' : 'Jawaban otomatis tersimpan'}
            </div>

            {currentPage < TOTAL_PAGES ? (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => goToPage(currentPage + 1)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <HiArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinish}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <HiCheckCircle className="h-4 w-4" />
                {isSubmitting ? 'Mengirim...' : 'Kirim Jawaban'}
              </button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default TestContainer