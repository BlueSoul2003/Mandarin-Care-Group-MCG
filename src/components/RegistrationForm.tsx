"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, CheckCircle, AlertCircle, Loader2, Lock, Eye, EyeOff, Check, X } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { useTranslations, useLocale } from "next-intl"

type Status = "idle" | "loading" | "success" | "error"

export function RegistrationForm() {
  const t = useTranslations("JoinPage.form")
  const locale = useLocale()
  const [status, setStatus] = React.useState<Status>("idle")
  const [errorMsg, setErrorMsg] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    birthday: "",
    majorYear: "",
    message: "",
    consent: false,
    website: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target instanceof HTMLInputElement && e.target.type === "checkbox"
      ? e.target.checked
      : e.target.value
    setForm((prev) => ({ ...prev, [e.target.name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setErrorMsg("")

    if (form.password !== form.confirmPassword) {
      setStatus("error")
      setErrorMsg(t("passwordMismatch"))
      return
    }

    try {
      // 1. Create Supabase Auth Account
      const supabase = createClient()
      const { error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.name,
            birthday: form.birthday,
          },
          // Redirect the user back to our site (not localhost) after they
          // click the confirmation link in the email Supabase sends them.
          emailRedirectTo: `${window.location.origin}/${locale}/login`,
        },
      })

      if (signUpError) {
        console.error("Supabase signup error:", signUpError)
        console.error("Supabase signup error details:", {
          message: signUpError.message,
          status: signUpError.status,
          name: signUpError.name,
        })

        setStatus("error")
        setErrorMsg(
          signUpError.message || "Supabase registration failed."
        )
        return
      }

      // 2. Push profile details to Notion via /api/register
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          birthday: form.birthday,
          majorYear: form.majorYear,
          message: form.message,
          consent: form.consent,
          website: form.website
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
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"

  return (
    <AnimatePresence mode="wait">
      {status === "success" ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center gap-4 py-16 text-center"
        >
          <CheckCircle className="w-16 h-16 text-emerald-400" />
          <h2 className="text-2xl font-bold font-heading text-foreground">{t("successTitle")}</h2>
          <p className="text-muted-foreground max-w-sm text-sm">
            {t("successDesc")}
          </p>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                {t("name")} <span className="text-red-400">*</span>
              </label>
              <input
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
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
                placeholder="john@example.com"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                {t("password")} <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                {t("confirmPassword")} <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={inputClass + " pr-10"}
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

          <label className="flex items-start gap-3 text-xs leading-relaxed text-muted-foreground pt-2">
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

          <button
            type="submit"
            disabled={status === "loading" || (form.password !== form.confirmPassword && form.confirmPassword.length > 0)}
            className="w-full flex items-center justify-center gap-2 bg-foreground text-background font-semibold py-3.5 rounded-xl hover:opacity-90 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
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
        </motion.form>
      )}
    </AnimatePresence>
  )
}
