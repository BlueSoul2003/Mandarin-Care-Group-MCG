"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

type Status = "idle" | "loading" | "success" | "error"

export function RegistrationForm() {
  const [status, setStatus] = React.useState<Status>("idle")
  const [errorMsg, setErrorMsg] = React.useState("")
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    phone: "",
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

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "送出失敗，請稍後再試。")
      }

      setStatus("success")
    } catch (err: unknown) {
      setStatus("error")
      setErrorMsg(err instanceof Error ? err.message : "送出失敗，請稍後再試。")
    }
  }

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"

  return (
    <AnimatePresence mode="wait">
      {status === "success" ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center gap-4 py-16 text-center"
        >
          <CheckCircle className="w-16 h-16 text-green-400" />
          <h2 className="text-2xl font-bold font-heading text-foreground">感謝您的報名！</h2>
          <p className="text-muted-foreground max-w-sm">
            我們已收到您的資料，執委會將盡快與您聯繫。主佑您！🙏
          </p>
          <button
            onClick={() => {
              setStatus("idle")
              setForm({ name: "", email: "", phone: "", majorYear: "", message: "", consent: false, website: "" })
            }}
            className="mt-4 px-6 py-2 rounded-full border border-white/20 text-sm hover:bg-white/10 transition-colors"
          >
            再填一份
          </button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">
                姓名 <span className="text-red-400">*</span>
              </label>
              <input
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="您的中文或英文名字"
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">
                電子信箱 <span className="text-red-400">*</span>
              </label>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">聯絡電話（選填）</label>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="例：+60 12-345 6789"
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">科系與年級（選填）</label>
              <input
                name="majorYear"
                value={form.majorYear}
                onChange={handleChange}
                placeholder="例：資工大一 / CS Year 1"
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">給我們的話（選填）</label>
            <textarea
              name="message"
              rows={4}
              value={form.message}
              onChange={handleChange}
              placeholder="有什麼想說的、想加入的原因，或對我們的期待…"
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

          <label className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
            <input
              name="consent"
              type="checkbox"
              required
              checked={form.consent}
              onChange={handleChange}
              className="mt-1 h-4 w-4 rounded border-border accent-primary"
            />
            <span>
              我同意 MCG 執委會使用以上資料與我聯絡；資料只供加入團體與活動聯繫使用。
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
            disabled={status === "loading"}
            className="w-full flex items-center justify-center gap-2 bg-foreground text-background font-semibold py-3.5 rounded-xl hover:opacity-90 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                送出中…
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                送出報名資料
              </>
            )}
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  )
}
