"use client"

import * as React from "react"
import { Link } from "@/i18n/routing"
import { motion } from "framer-motion"
import { Mail, Send, CheckCircle, AlertCircle, Loader2, ArrowLeft } from "lucide-react"
import { createRecoveryClient } from "@/lib/supabase"
import { useTranslations, useLocale } from "next-intl"

export default function ForgotPasswordPage() {
  const t = useTranslations("ForgotPassword")
  const locale = useLocale()
  const [email, setEmail] = React.useState("")
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setErrorMsg("")

    try {
      const supabase = createRecoveryClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        // Include the active locale so the reset page loads in the same language
        redirectTo: `${window.location.origin}/${locale}/reset-password`,
      })

      if (error) {
        setStatus("error")
        setErrorMsg(error.message)
        return
      }

      setStatus("success")
    } catch {
      setStatus("error")
      setErrorMsg(t("noEmail"))
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      {/* Background Glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[140px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl border border-border bg-card p-8 md:p-10 shadow-xl backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-2 block">
              Mandarin Care Group
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-card-foreground mb-2">
              {t("title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("description")}
            </p>
          </div>

          {status === "success" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center gap-4 py-8 text-center"
            >
              <CheckCircle className="w-14 h-14 text-emerald-500" />
              <h2 className="text-xl font-bold text-card-foreground">{t("successTitle")}</h2>
              <p className="text-sm text-muted-foreground max-w-xs">
                {t("successDesc")}{" "}
                <span className="font-semibold text-foreground">{email}</span>.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t("successHint")}
              </p>
              <Link
                href="/login"
                className="mt-4 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all"
              >
                {t("backToLogin")}
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {status === "error" && (
                <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  {t("emailLabel")}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-background border border-input rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-full hover:opacity-90 active:scale-[0.98] transition-all duration-200 shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t("sending")}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t("sendButton")}</span>
                  </>
                )}
              </button>

              {/* Back to login */}
              <div className="pt-4 text-center border-t border-border/50">
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {t("backToLogin")}
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
