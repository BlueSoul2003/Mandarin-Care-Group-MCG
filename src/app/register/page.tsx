"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { User, Mail, Lock, Eye, EyeOff, UserPlus, CheckCircle, AlertCircle, Loader2, Check, X } from "lucide-react"
import { createClient } from "@/lib/supabase"

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = React.useState(false)
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = React.useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setErrorMsg("")

    if (form.password !== form.confirmPassword) {
      setStatus("error")
      setErrorMsg("二次輸入密碼不一致！")
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.name,
        },
      },
    })

    if (error) {
      setStatus("error")
      setErrorMsg(error.message)
    } else {
      setStatus("success")
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      {/* Background Glow Blobs */}
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
              建立新帳號
            </h1>
            <p className="text-sm text-muted-foreground">
              Create Account · 加入我們的社群
            </p>
          </div>

          {status === "success" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center gap-4 py-8 text-center"
            >
              <CheckCircle className="w-14 h-14 text-emerald-500" />
              <h2 className="text-xl font-bold text-card-foreground">請確認您的電子郵件！</h2>
              <p className="text-sm text-muted-foreground max-w-xs">
                我們已向 <span className="font-semibold text-foreground">{form.email}</span> 發送了一封驗證郵件。
                請點擊郵件中的連結來啟動您的帳號。
              </p>
              <Link
                href="/login"
                className="mt-4 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all"
              >
                前往登入 Login
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {status === "error" && (
                <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  全名 Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full bg-background border border-input rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  電子郵件 Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="w-full bg-background border border-input rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                    密碼 Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-background border border-input rounded-xl pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                    確認密碼 Confirm
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      required
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-background border border-input rounded-xl pl-9 pr-8 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Password Match Indicator — below the grid, never shifts layout */}
              <div className="h-5">
                {form.confirmPassword && (
                  <p className={`text-xs flex items-center gap-1 ${form.password === form.confirmPassword ? "text-emerald-500" : "text-destructive"}`}>
                    {form.password === form.confirmPassword
                      ? <><Check className="w-3 h-3" /> 密碼相符</>
                      : <><X className="w-3 h-3" /> 密碼不符</>}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-full hover:opacity-90 active:scale-[0.98] transition-all duration-200 shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>註冊中...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>註冊 Register</span>
                  </>
                )}
              </button>

              {/* Redirect to Login */}
              <div className="pt-4 text-center border-t border-border/50 text-sm text-muted-foreground">
                已經有帳號？{" "}
                <Link href="/login" className="text-primary font-semibold hover:underline">
                  直接登入 Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
