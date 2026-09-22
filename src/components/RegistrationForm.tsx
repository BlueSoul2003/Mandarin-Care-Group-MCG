"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  Check,
  X,
  Mail,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
} from "lucide-react"
import { createClient } from "@/lib/supabase"
import { useTranslations, useLocale } from "next-intl"
import { Link } from "@/i18n/routing"

type Status = "idle" | "loading" | "success" | "error"

export function RegistrationForm() {
  const t = useTranslations("JoinPage.form")
  const locale = useLocale()
  const [status, setStatus] = React.useState<Status>("idle")
  const [errorMsg, setErrorMsg] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [countdown, setCountdown] = React.useState(60)
  const [resendStatus, setResendStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle")
  const [resendErrorMsg, setResendErrorMsg] = React.useState("")

  // Multi-step questions state
  const [currentStep, setCurrentStep] = React.useState<1 | 2>(1)
  const [sacraments, setSacraments] = React.useState<string[]>([])
  const [parishServices, setParishServices] = React.useState<string[]>([])
  const [parishServiceOther, setParishServiceOther] = React.useState("")
  const [showParishOther, setShowParishOther] = React.useState(false)
  const [gifts, setGifts] = React.useState<string[]>([])
  const [giftOther, setGiftOther] = React.useState("")
  const [showGiftOther, setShowGiftOther] = React.useState(false)

  // Expectations from MCG (all applicants)
  const [expectations, setExpectations] = React.useState<string[]>([])
  const [expectationOther, setExpectationOther] = React.useState("")
  const [showExpectationOther, setShowExpectationOther] = React.useState(false)

  // Interested activities (all applicants)
  const [activities, setActivities] = React.useState<string[]>([])
  const [activityOther, setActivityOther] = React.useState("")
  const [showActivityOther, setShowActivityOther] = React.useState(false)

  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    birthday: "",
    majorYear: "",
    faithStatus: "",
    message: "",
    consent: false,
    website: "",
  })

  const isCatholic =
    form.faithStatus === "catholic_new" || form.faithStatus === "catholic_senior"
  const isChristianNonCatholic =
    form.faithStatus === "christian_non_catholic"

  const toggleSacrament = (key: string) => {
    setSacraments((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const toggleParishService = (key: string) => {
    setParishServices((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const toggleGift = (key: string) => {
    setGifts((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const toggleExpectation = (key: string) => {
    setExpectations((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const toggleActivity = (key: string) => {
    setActivities((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  // Count down every second when on success screen and countdown > 0
  React.useEffect(() => {
    if (status !== "success" || countdown <= 0) return

    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [status, countdown])

  const handleResendConfirmation = async () => {
    if (countdown > 0 || resendStatus === "loading") return

    setResendStatus("loading")
    setResendErrorMsg("")

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: form.email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/${locale}/login`,
        },
      })

      if (error) {
        setResendStatus("error")
        setResendErrorMsg(error.message || t("resendError"))
        return
      }

      setResendStatus("success")
      setCountdown(60)
    } catch (err) {
      setResendStatus("error")
      setResendErrorMsg(err instanceof Error ? err.message : t("resendError"))
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target instanceof HTMLInputElement && e.target.type === "checkbox"
      ? e.target.checked
      : e.target.value
    setForm((prev) => ({ ...prev, [e.target.name]: value }))
  }

  const handleContinueToStep2 = () => {
    setErrorMsg("")
    const cleanName = form.name.trim()
    const cleanEmail = form.email.trim()

    if (!cleanName) {
      setStatus("error")
      setErrorMsg(t("nameRequired"))
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      setStatus("error")
      setErrorMsg(t("invalidEmail"))
      return
    }

    if (form.password.length < 6) {
      setStatus("error")
      setErrorMsg(t("passwordTooShort"))
      return
    }

    if (form.password !== form.confirmPassword) {
      setStatus("error")
      setErrorMsg(t("passwordMismatch"))
      return
    }

    if (!form.faithStatus) {
      setStatus("error")
      setErrorMsg(t("faithStatusPlaceholder"))
      return
    }

    setStatus("idle")
    setCurrentStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setErrorMsg("")

    // Pre-flight client-side validation before touching Supabase or Notion
    const cleanName = form.name.trim()
    const cleanEmail = form.email.trim()

    if (!cleanName) {
      setStatus("error")
      setErrorMsg(t("nameRequired"))
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      setStatus("error")
      setErrorMsg(t("invalidEmail"))
      return
    }

    if (form.password.length < 6) {
      setStatus("error")
      setErrorMsg(t("passwordTooShort"))
      return
    }

    if (form.password !== form.confirmPassword) {
      setStatus("error")
      setErrorMsg(t("passwordMismatch"))
      return
    }

    if (!form.consent) {
      setStatus("error")
      setErrorMsg(t("consentRequired"))
      return
    }

    try {
      const isChristianBackground = isCatholic || isChristianNonCatholic
      const sacramentsPayload = isCatholic
        ? sacraments.map((k) => t(`sacraments.${k}` as any))
        : []
      const parishServicesPayload = isChristianBackground
        ? parishServices.map((k) => t(`parishServiceOptions.${k}` as any))
        : []
      const giftsPayload = isChristianBackground
        ? gifts.map((k) => t(`giftOptions.${k}` as any))
        : []
      const expectationsPayload = expectations.map((k) =>
        t(`expectationOptions.${k}` as any)
      )
      const activitiesPayload = activities.map((k) =>
        t(`activityInterestOptions.${k}` as any)
      )

      // 1. First validate & push registration details to Notion via /api/register
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          phone: form.phone.trim(),
          birthday: form.birthday.trim(),
          majorYear: form.majorYear.trim(),
          faithStatus: form.faithStatus
            ? t(`faithOptions.${form.faithStatus}` as any)
            : "",
          sacraments: sacramentsPayload,
          parishServices: parishServicesPayload,
          parishServiceOther: isChristianBackground && showParishOther ? parishServiceOther.trim() : "",
          gifts: giftsPayload,
          giftOther: isChristianBackground && showGiftOther ? giftOther.trim() : "",
          expectations: expectationsPayload,
          expectationOther: showExpectationOther ? expectationOther.trim() : "",
          activities: activitiesPayload,
          activityOther: showActivityOther ? activityOther.trim() : "",
          message: form.message.trim(),
          consent: form.consent,
          website: form.website,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        console.error("Registration API error:", data)
        const message =
          typeof data.error === "string"
            ? data.error
            : data.message
              ? String(data.message)
              : "Failed to submit. Please try again."

        throw new Error(message)
      }

      // 2. Only after registration is accepted by Notion, create the Supabase Auth account
      const supabase = createClient()
      const { error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: form.password,
        options: {
          data: {
            full_name: cleanName,
            birthday: form.birthday.trim(),
          },
          // Redirect the user back to our site after email confirmation
          emailRedirectTo: `${window.location.origin}/${locale}/login`,
        },
      })

      if (signUpError) {
        console.error("Supabase signup error:", signUpError)
        setStatus("error")
        setErrorMsg(
          signUpError.message || "Supabase registration failed."
        )
        return
      }

      setCountdown(60)
      setStatus("success")
    } catch (err) {
      console.error("Registration failed:", err)
      setStatus("error")
      if (err instanceof Error) {
        setErrorMsg(err.message || "Failed to submit. Please try again.")
      } else {
        setErrorMsg("An unexpected error occurred. Please try again.")
      }
    }
  }

  const inputClass =
    "w-full bg-black/[0.03] dark:bg-white/5 border border-border dark:border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"

  return (
    <AnimatePresence mode="wait">
      {status === "success" ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center gap-6 py-8 text-center"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
              <CheckCircle className="w-9 h-9" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
              <Mail className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-heading text-foreground">{t("successTitle")}</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
              {t("successDesc", { email: form.email })}{" "}
            </p>
          </div>

          {/* Spam / Junk Notice Box */}
          <div className="w-full max-w-md rounded-xl bg-amber-500/10 dark:bg-amber-500/10 border border-amber-600/30 dark:border-amber-500/20 p-4 text-left flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 dark:text-amber-200 leading-relaxed font-medium">
              {t("spamCheckNotice")}
            </div>
          </div>

          {/* Resend Confirmation Section */}
          <div className="w-full max-w-md rounded-xl bg-muted/40 dark:bg-white/5 border border-border dark:border-white/10 p-5 text-center space-y-3">
            <p className="text-xs text-muted-foreground font-medium">{t("resendPrompt")}</p>
            
            <button
              type="button"
              onClick={handleResendConfirmation}
              disabled={countdown > 0 || resendStatus === "loading"}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-background hover:bg-muted dark:bg-white/10 dark:hover:bg-white/15 text-foreground transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-border dark:border-white/10 shadow-xs"
            >
              {resendStatus === "loading" ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{t("resending")}</span>
                </>
              ) : countdown > 0 ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 opacity-60" />
                  <span>{t("resendCountdown", { seconds: countdown })}</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-primary" />
                  <span>{t("resendButton")}</span>
                </>
              )}
            </button>

            {resendStatus === "success" && (
              <p className="text-xs text-emerald-400 font-medium">
                {t("resendSuccess")}
              </p>
            )}

            {resendStatus === "error" && (
              <p className="text-xs text-red-400 font-medium">
                {resendErrorMsg || t("resendError")}
              </p>
            )}
          </div>

          {/* Action Link */}
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all shadow-md"
            >
              {t("goToLogin")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {currentStep === 1 ? (
            <>
              {/* Step 1: Account & Profile Details */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                  {t("name")} <span className="text-red-400">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                  {t("email")} <span className="text-red-400">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                  {t("password")} <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                  {t("confirmPassword")} <span className="text-red-400">*</span>
                </label>
                <input
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>

              <div className="h-5 -mt-2">
                {form.confirmPassword && (
                  <p className={`text-xs flex items-center gap-1 ${form.password === form.confirmPassword ? "text-emerald-400" : "text-red-400"}`}>
                    {form.password === form.confirmPassword
                      ? <><Check className="w-3 h-3" /> {t("passwordMatch")}</>
                      : <><X className="w-3 h-3" /> {t("passwordMismatch")}</>}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                    {t("phone")} <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+60 12-345 6789"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                    {t("birthday")} <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="birthday"
                    type="date"
                    required
                    value={form.birthday}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                  {t("majorYear")}
                </label>
                <input
                  name="majorYear"
                  value={form.majorYear}
                  onChange={handleChange}
                  placeholder={t("majorPlaceholder")}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                  {t("faithStatus")} <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select
                    name="faithStatus"
                    required
                    value={form.faithStatus}
                    onChange={handleChange}
                    className={`${inputClass} pr-10 appearance-none cursor-pointer ${
                      !form.faithStatus ? "text-muted-foreground/60" : "text-foreground"
                    }`}
                  >
                    <option value="" disabled className="bg-background text-muted-foreground">
                      {t("faithStatusPlaceholder")}
                    </option>
                    <option value="catholic_new" className="bg-background text-foreground">
                      {t("faithOptions.catholic_new")}
                    </option>
                    <option value="catholic_senior" className="bg-background text-foreground">
                      {t("faithOptions.catholic_senior")}
                    </option>
                    <option value="christian_non_catholic" className="bg-background text-foreground">
                      {t("faithOptions.christian_non_catholic")}
                    </option>
                    <option value="interested_non_christian" className="bg-background text-foreground">
                      {t("faithOptions.interested_non_christian")}
                    </option>
                    <option value="not_thought_yet" className="bg-background text-foreground">
                      {t("faithOptions.not_thought_yet")}
                    </option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              {status === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}

              <button
                type="button"
                onClick={handleContinueToStep2}
                disabled={status === "loading" || (form.password !== form.confirmPassword && form.confirmPassword.length > 0)}
                className="w-full flex items-center justify-center gap-2 bg-foreground text-background font-semibold py-3.5 rounded-xl hover:opacity-90 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                <span>{t("continue")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              {/* Question 1: Sacraments (Catholics only) */}
              {isCatholic && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                    {t("sacramentsTitle")}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { key: "baptism", label: t("sacraments.baptism") },
                      { key: "firstCommunion", label: t("sacraments.firstCommunion") },
                      { key: "confirmation", label: t("sacraments.confirmation") },
                    ].map((opt) => {
                      const checked = sacraments.includes(opt.key)
                      return (
                        <button
                          type="button"
                          key={opt.key}
                          onClick={() => toggleSacrament(opt.key)}
                          className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all text-left ${
                            checked
                              ? "bg-primary/15 border-primary text-foreground ring-1 ring-primary/30"
                              : "bg-black/[0.03] dark:bg-white/5 border-border dark:border-white/10 text-muted-foreground hover:border-foreground/30 dark:hover:border-white/20 hover:text-foreground"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                              checked
                                ? "bg-primary border-primary text-primary-foreground shadow-xs"
                                : "border-neutral-400 bg-white dark:border-white/50 dark:bg-white/10 group-hover:border-primary dark:group-hover:border-primary"
                            }`}
                          >
                            {checked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="truncate">{opt.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Question 2: Parish Service & Question 3: Gifts (Christian background only) */}
              {(isCatholic || isChristianNonCatholic) && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                      {t("parishServiceTitle")}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { key: "lector", label: t("parishServiceOptions.lector") },
                        { key: "choir", label: t("parishServiceOptions.choir") },
                        { key: "instrumentalist", label: t("parishServiceOptions.instrumentalist") },
                        { key: "altarServer", label: t("parishServiceOptions.altarServer") },
                        { key: "youthGroup", label: t("parishServiceOptions.youthGroup") },
                      ].map((opt) => {
                        const checked = parishServices.includes(opt.key)
                        return (
                          <button
                            type="button"
                            key={opt.key}
                            onClick={() => toggleParishService(opt.key)}
                            className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all text-left ${
                              checked
                                ? "bg-primary/15 border-primary text-foreground ring-1 ring-primary/30"
                                : "bg-black/[0.03] dark:bg-white/5 border-border dark:border-white/10 text-muted-foreground hover:border-foreground/30 dark:hover:border-white/20 hover:text-foreground"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                                checked
                                  ? "bg-primary border-primary text-primary-foreground shadow-xs"
                                  : "border-neutral-400 bg-white dark:border-white/50 dark:bg-white/10 group-hover:border-primary dark:group-hover:border-primary"
                              }`}
                            >
                              {checked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="truncate">{opt.label}</span>
                          </button>
                        )
                      })}
                      <button
                        type="button"
                        onClick={() => setShowParishOther(!showParishOther)}
                        className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all text-left ${
                          showParishOther
                            ? "bg-primary/15 border-primary text-foreground ring-1 ring-primary/30"
                            : "bg-black/[0.03] dark:bg-white/5 border-border dark:border-white/10 text-muted-foreground hover:border-foreground/30 dark:hover:border-white/20 hover:text-foreground"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                            showParishOther
                              ? "bg-primary border-primary text-primary-foreground shadow-xs"
                              : "border-neutral-400 bg-white dark:border-white/50 dark:bg-white/10 group-hover:border-primary dark:group-hover:border-primary"
                          }`}
                        >
                          {showParishOther && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>{t("otherLabel")}...</span>
                      </button>
                    </div>
                    {showParishOther && (
                      <input
                        type="text"
                        value={parishServiceOther}
                        onChange={(e) => setParishServiceOther(e.target.value)}
                        placeholder={t("otherPlaceholder")}
                        className={`${inputClass} text-xs mt-1.5`}
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                      {t("giftsTitle")}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { key: "singing", label: t("giftOptions.singing") },
                        { key: "instrument", label: t("giftOptions.instrument") },
                        { key: "publicSpeaking", label: t("giftOptions.publicSpeaking") },
                        { key: "media", label: t("giftOptions.media") },
                        { key: "eventPlanning", label: t("giftOptions.eventPlanning") },
                        { key: "design", label: t("giftOptions.design") },
                      ].map((opt) => {
                        const checked = gifts.includes(opt.key)
                        return (
                          <button
                            type="button"
                            key={opt.key}
                            onClick={() => toggleGift(opt.key)}
                            className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all text-left ${
                              checked
                                ? "bg-primary/15 border-primary text-foreground ring-1 ring-primary/30"
                                : "bg-black/[0.03] dark:bg-white/5 border-border dark:border-white/10 text-muted-foreground hover:border-foreground/30 dark:hover:border-white/20 hover:text-foreground"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                                checked
                                  ? "bg-primary border-primary text-primary-foreground shadow-xs"
                                  : "border-neutral-400 bg-white dark:border-white/50 dark:bg-white/10 group-hover:border-primary dark:group-hover:border-primary"
                              }`}
                            >
                              {checked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="truncate">{opt.label}</span>
                          </button>
                        )
                      })}
                      <button
                        type="button"
                        onClick={() => setShowGiftOther(!showGiftOther)}
                        className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all text-left sm:col-span-2 ${
                          showGiftOther
                            ? "bg-primary/15 border-primary text-foreground ring-1 ring-primary/30"
                            : "bg-black/[0.03] dark:bg-white/5 border-border dark:border-white/10 text-muted-foreground hover:border-foreground/30 dark:hover:border-white/20 hover:text-foreground"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                            showGiftOther
                              ? "bg-primary border-primary text-primary-foreground shadow-xs"
                              : "border-neutral-400 bg-white dark:border-white/50 dark:bg-white/10 group-hover:border-primary dark:group-hover:border-primary"
                          }`}
                        >
                          {showGiftOther && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>{t("otherLabel")}...</span>
                      </button>
                    </div>
                    {showGiftOther && (
                      <input
                        type="text"
                        value={giftOther}
                        onChange={(e) => setGiftOther(e.target.value)}
                        placeholder={t("otherPlaceholder")}
                        className={`${inputClass} text-xs mt-1.5`}
                      />
                    )}
                  </div>
                </>
              )}

              {/* Question 4: Expectations from MCG (For ALL applicants) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                  {t("expectationsTitle")}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { key: "newFriends", label: t("expectationOptions.newFriends") },
                    { key: "faithExploration", label: t("expectationOptions.faithExploration") },
                    { key: "lifeSupport", label: t("expectationOptions.lifeSupport") },
                    { key: "joiningEvents", label: t("expectationOptions.joiningEvents") },
                  ].map((opt) => {
                    const checked = expectations.includes(opt.key)
                    return (
                      <button
                        type="button"
                        key={opt.key}
                        onClick={() => toggleExpectation(opt.key)}
                        className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all text-left ${
                          checked
                            ? "bg-primary/15 border-primary text-foreground ring-1 ring-primary/30"
                            : "bg-black/[0.03] dark:bg-white/5 border-border dark:border-white/10 text-muted-foreground hover:border-foreground/30 dark:hover:border-white/20 hover:text-foreground"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                            checked
                              ? "bg-primary border-primary text-primary-foreground shadow-xs"
                              : "border-neutral-400 bg-white dark:border-white/50 dark:bg-white/10 group-hover:border-primary dark:group-hover:border-primary"
                          }`}
                        >
                          {checked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="truncate">{opt.label}</span>
                      </button>
                    )
                  })}
                  <button
                    type="button"
                    onClick={() => setShowExpectationOther(!showExpectationOther)}
                    className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all text-left sm:col-span-2 ${
                      showExpectationOther
                        ? "bg-primary/15 border-primary text-foreground ring-1 ring-primary/30"
                        : "bg-black/[0.03] dark:bg-white/5 border-border dark:border-white/10 text-muted-foreground hover:border-foreground/30 dark:hover:border-white/20 hover:text-foreground"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                        showExpectationOther
                          ? "bg-primary border-primary text-primary-foreground shadow-xs"
                          : "border-neutral-400 bg-white dark:border-white/50 dark:bg-white/10 group-hover:border-primary dark:group-hover:border-primary"
                      }`}
                    >
                      {showExpectationOther && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span>{t("otherLabel")}...</span>
                  </button>
                </div>
                {showExpectationOther && (
                  <input
                    type="text"
                    value={expectationOther}
                    onChange={(e) => setExpectationOther(e.target.value)}
                    placeholder={t("otherPlaceholder")}
                    className={`${inputClass} text-xs mt-1.5`}
                  />
                )}
              </div>

              {/* Question 5: Activity Interests (For ALL applicants) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                  {t("activitiesTitle")}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { key: "faithSharing", label: t("activityInterestOptions.faithSharing") },
                    { key: "faithQa", label: t("activityInterestOptions.faithQa") },
                    { key: "smallGroups", label: t("activityInterestOptions.smallGroups") },
                    { key: "campusEvents", label: t("activityInterestOptions.campusEvents") },
                  ].map((opt) => {
                    const checked = activities.includes(opt.key)
                    return (
                      <button
                        type="button"
                        key={opt.key}
                        onClick={() => toggleActivity(opt.key)}
                        className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all text-left ${
                          checked
                            ? "bg-primary/15 border-primary text-foreground ring-1 ring-primary/30"
                            : "bg-black/[0.03] dark:bg-white/5 border-border dark:border-white/10 text-muted-foreground hover:border-foreground/30 dark:hover:border-white/20 hover:text-foreground"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                            checked
                              ? "bg-primary border-primary text-primary-foreground shadow-xs"
                              : "border-neutral-400 bg-white dark:border-white/50 dark:bg-white/10 group-hover:border-primary dark:group-hover:border-primary"
                          }`}
                        >
                          {checked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="truncate">{opt.label}</span>
                      </button>
                    )
                  })}
                  <button
                    type="button"
                    onClick={() => setShowActivityOther(!showActivityOther)}
                    className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all text-left sm:col-span-2 ${
                      showActivityOther
                        ? "bg-primary/15 border-primary text-foreground ring-1 ring-primary/30"
                        : "bg-black/[0.03] dark:bg-white/5 border-border dark:border-white/10 text-muted-foreground hover:border-foreground/30 dark:hover:border-white/20 hover:text-foreground"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                        showActivityOther
                          ? "bg-primary border-primary text-primary-foreground shadow-xs"
                          : "border-neutral-400 bg-white dark:border-white/50 dark:bg-white/10 group-hover:border-primary dark:group-hover:border-primary"
                      }`}
                    >
                      {showActivityOther && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span>{t("otherLabel")}...</span>
                  </button>
                </div>
                {showActivityOther && (
                  <input
                    type="text"
                    value={activityOther}
                    onChange={(e) => setActivityOther(e.target.value)}
                    placeholder={t("otherPlaceholder")}
                    className={`${inputClass} text-xs mt-1.5`}
                  />
                )}
              </div>

              {/* Message & Consent on Step 2 */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                  {t("message")}
                </label>
                <textarea
                  name="message"
                  rows={3}
                  value={form.message}
                  onChange={handleChange}
                  placeholder={t("messagePlaceholder")}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.website}
                  onChange={handleChange}
                />
              </div>

              <label className="flex items-start gap-3 text-xs leading-relaxed text-muted-foreground pt-1">
                <input
                  name="consent"
                  type="checkbox"
                  required
                  checked={form.consent}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
                />
                <span>
                  {t("consent")}
                </span>
              </label>

              {status === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}

              {/* Navigation buttons: Back and Submit */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg("")
                    setCurrentStep(1)
                  }}
                  className="px-5 py-3.5 rounded-xl border border-border dark:border-white/15 bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.06] dark:hover:bg-white/10 text-foreground font-semibold text-sm transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t("back")}</span>
                </button>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="flex-1 flex items-center justify-center gap-2 bg-foreground text-background font-semibold py-3.5 rounded-xl hover:opacity-90 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t("loading")}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {t("submit")}
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </motion.form>
      )}
    </AnimatePresence>
  )
}
