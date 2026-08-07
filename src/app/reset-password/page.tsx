"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, Check, X, ShieldCheck } from "lucide-react"
import { createRecoveryClient } from "@/lib/supabase"

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = React.useState(false)
  const [form, setForm] = React.useState({ password: "", confirmPassword: "" })
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = React.useState("")
  const [recoveryState, setRecoveryState] = React.useState<"checking" | "ready" | "invalid">("checking")

  // Recovery uses Supabase's browser-only implicit flow. Its tokens arrive in
  // the URL hash, which allows a link opened from an email app to work too.
  React.useEffect(() => {
    const supabase = createRecoveryClient()
    let isMounted = true
    const hasRecoveryCallback =
      window.location.hash.includes("access_token") &&
      window.location.hash.includes("type=recovery")

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setRecoveryState("ready")
      } else if (event === "INITIAL_SESSION" && session && hasRecoveryCallback) {
        setRecoveryState("ready")
      }
    })

    const confirmRecoverySession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (isMounted) {
        setRecoveryState(session && hasRecoveryCallback ? "ready" : "invalid")
      }
    }

    void confirmRecoverySession()

    return () => {
      isMounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      setStatus("error")
      setErrorMsg("二次輸入密碼不一致！")
      return
    }

    setStatus("loading")
    setErrorMsg("")

    const supabase = createRecoveryClient()
    const { error } = await supabase.auth.updateUser({ password: form.password })

    if (error) {
      setStatus("error")
      setErrorMsg(error.message)
    } else {
      setStatus("success")
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
              重設密碼
            </h1>
            <p className="text-sm text-muted-foreground">
              Reset Password · 請輸入您的新密碼
            </p>
          </div>

          {status === "success" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center gap-4 py-8 text-center"
            >
              <CheckCircle className="w-14 h-14 text-emerald-500" />
              <h2 className="text-xl font-bold text-card-foreground">密碼已更新！</h2>
              <p className="text-sm text-muted-foreground">
                您的密碼已成功重設。請使用新密碼登入。
              </p>
              <Link
                href="/login"
                className="mt-4 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all"
              >
                前往登入 Login
              </Link>
            </motion.div>
          ) : recoveryState === "checking" ? (
            <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">正在驗證重設連結…</p>
            </div>
          ) : recoveryState === "invalid" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center gap-4 py-8 text-center"
            >
              <AlertCircle className="w-14 h-14 text-destructive" />
              <h2 className="text-xl font-bold text-card-foreground">連結已失效</h2>
              <p className="text-sm text-muted-foreground max-w-xs">
                此重設連結已過期或無效（連結有效期為 1 小時）。請重新申請。
              </p>
              <Link
                href="/forgot-password"
                className="mt-4 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all"
              >
                重新申請 Try Again
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

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  新密碼 New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-background border border-input rounded-xl pl-10 pr-10 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  確認新密碼 Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-background border border-input rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Live Match Indicator */}
              <div className="h-5">
                {form.confirmPassword && (
                  <p className={`text-xs flex items-center gap-1 ${form.password === form.confirmPassword ? "text-emerald-500" : "text-destructive"}`}>
                    {form.password === form.confirmPassword
                      ? <><Check className="w-3 h-3" /> 密碼相符</>
                      : <><X className="w-3 h-3" /> 密碼不符</>}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={status === "loading" || form.password !== form.confirmPassword}
                className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-full hover:opacity-90 active:scale-[0.98] transition-all duration-200 shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>更新中...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>更新密碼 Update Password</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
