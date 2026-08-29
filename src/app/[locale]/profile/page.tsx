"use client"

import { useEffect, useState, useRef } from "react"
import { useFavoritesStore } from "@/store/useFavoritesStore"
import { usePlayerStore } from "@/store/usePlayerStore"
import { createClient, createRecoveryClient } from "@/lib/supabase"
import { createClient as createIsolatedClient } from "@supabase/supabase-js"
import type { User } from "@supabase/supabase-js"
import { Link, useRouter } from "@/i18n/routing"
import { useTranslations, useLocale } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"
import { getSongCategory } from "@/lib/songUtils"
import {
  User as UserIcon,
  Heart,
  Music,
  Play,
  Pause,
  Trash2,
  Disc3,
  LogIn,
  LogOut,
  Sparkles,
  ShieldCheck,
  Camera,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  X,
  Upload,
  UserX,
  MailCheck,
  Send,
  UserPlus,
  Compass,
} from "lucide-react"

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0 || !parts[0]) return "U"
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export default function ProfilePage() {
  const t = useTranslations("Profile")
  const locale = useLocale()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  // Modals state
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Avatar edit state
  const [selectedAvatar, setSelectedAvatar] = useState<string>("")
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false)
  const [avatarSuccessMsg, setAvatarSuccessMsg] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Password reset via email flow state
  const [currentPassword, setCurrentPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [emailSentSuccess, setEmailSentSuccess] = useState(false)
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false)

  // Delete account state
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const { favorites, toggleFavorite, clearFavorites } = useFavoritesStore()
  const { currentTrack, isPlaying, play, togglePlay } = usePlayerStore()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user?.user_metadata?.avatar_url) {
        setAvatarUrl(data.user.user_metadata.avatar_url)
      }
      setIsLoadingAuth(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user?.user_metadata?.avatar_url) {
        setAvatarUrl(session.user.user_metadata.avatar_url)
      }
      setIsLoadingAuth(false)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
  }

  // Handle local image file upload & compression
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const maxDim = 256
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width)
            width = maxDim
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height)
            height = maxDim
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        ctx?.drawImage(img, 0, 0, width, height)
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85)
        setSelectedAvatar(compressedBase64)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleSaveAvatar = async () => {
    const finalAvatar = selectedAvatar
    if (!finalAvatar) return

    try {
      setIsUpdatingAvatar(true)
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: finalAvatar },
      })

      if (error) throw error

      setAvatarUrl(finalAvatar)
      setAvatarSuccessMsg(t("avatarUpdated"))
      setTimeout(() => {
        setShowAvatarModal(false)
        setAvatarSuccessMsg("")
      }, 1200)
    } catch (err: any) {
      console.error("Failed to update avatar:", err)
      alert(err?.message || "Failed to update avatar")
    } finally {
      setIsUpdatingAvatar(false)
    }
  }

  // Request Password Reset Confirmation Email after verifying current password
  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")

    if (!currentPassword) {
      setPasswordError(t("currentPasswordRequired"))
      return
    }

    if (!user?.email) {
      setPasswordError("No account email found.")
      return
    }

    try {
      setIsSendingResetEmail(true)

      // Use isolated client to verify current password without cookie mutation
      const verifyClient = createIsolatedClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key",
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        }
      )

      const { error: signInError } = await verifyClient.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })

      if (signInError) {
        setPasswordError(t("currentPasswordIncorrect"))
        setIsSendingResetEmail(false)
        return
      }

      // Verified! Request confirmation email with reset link
      const recoveryClient = createRecoveryClient()
      const { error: resetError } = await recoveryClient.auth.resetPasswordForEmail(
        user.email,
        {
          redirectTo: `${window.location.origin}/${locale}/reset-password`,
        }
      )

      if (resetError) {
        throw resetError
      }

      setEmailSentSuccess(true)
      setCurrentPassword("")
    } catch (err: any) {
      console.error("Failed to send reset email:", err)
      setPasswordError(err?.message || "Failed to send reset email.")
    } finally {
      setIsSendingResetEmail(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      setIsDeletingAccount(true)
      setDeleteError("")

      const supabase = createClient()
      let {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        const { data: refreshed } = await supabase.auth.refreshSession()
        session = refreshed.session
      }

      const token = session?.access_token

      if (!token) {
        throw new Error("No active session found. Please log in again.")
      }

      const res = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to delete account.")
      }

      await supabase.auth.signOut()
      setUser(null)
      clearFavorites()
      setShowDeleteModal(false)
      router.replace("/")
    } catch (err: any) {
      console.error("Account deletion failed:", err)
      setDeleteError(err?.message || "Failed to delete account.")
    } finally {
      setIsDeletingAccount(false)
    }
  }

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "MCG Member"

  const initials = getInitials(displayName)

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 max-w-4xl min-h-[85vh]">
      {/* Profile Header: Distinct & Beautiful for Member vs Guest */}
      {user ? (
        /* Member Profile Card */
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 md:p-8 rounded-3xl border border-border/60 bg-card shadow-sm mb-8 relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4 md:gap-5">
              {/* Avatar Container with Edit Overlay */}
              <div className="relative group">
                {avatarUrl ? (
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border border-border/80 shadow-md bg-muted flex items-center justify-center text-3xl">
                    {avatarUrl.startsWith("data:") || avatarUrl.startsWith("http") ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{avatarUrl}</span>
                    )}
                  </div>
                ) : (
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-tr from-primary to-primary/70 text-primary-foreground flex items-center justify-center font-bold text-xl md:text-2xl shadow-lg shadow-primary/20 shrink-0">
                    {initials}
                  </div>
                )}

                {/* Change Avatar Button */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAvatar(avatarUrl)
                    setShowAvatarModal(true)
                  }}
                  className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-primary text-primary-foreground shadow-md hover:scale-110 active:scale-95 transition-transform"
                  title={t("changeAvatar")}
                  aria-label={t("changeAvatar")}
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground truncate">
                    {displayName}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                    <ShieldCheck className="w-3 h-3" />
                    Member
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>

            {/* Member Actions */}
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => {
                  setCurrentPassword("")
                  setPasswordError("")
                  setEmailSentSuccess(false)
                  setShowPasswordModal(true)
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border/80 bg-background text-foreground text-xs font-semibold hover:bg-muted transition-colors shadow-sm"
              >
                <KeyRound className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{t("changePassword")}</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-destructive/30 text-destructive text-xs font-semibold hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t("logout")}</span>
              </button>
            </div>
          </div>

          {/* Stats 2-Column Grid */}
          <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-border/40">
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/40">
              <p className="text-xs text-muted-foreground mb-1 font-medium">{t("totalFavorites")}</p>
              <p className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Heart className="w-5 h-5 fill-amber-500 text-amber-500 dark:text-amber-400 dark:fill-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]" />
                <span>{favorites.length}</span>
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/40">
              <p className="text-xs text-muted-foreground mb-1 font-medium">{t("status")}</p>
              <p className="text-base font-semibold text-foreground mt-1">
                {t("statusActive")}
              </p>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Guest Mode Hero Welcome Card */
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 md:p-10 rounded-3xl border border-border/70 bg-gradient-to-b from-card via-card to-muted/30 shadow-md mb-8 relative overflow-hidden"
        >
          {/* Subtle Ambient Background Accent */}
          <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Left: Avatar & Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 flex-1 min-w-0">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-muted/80 border border-border/80 flex items-center justify-center text-muted-foreground shadow-sm shrink-0">
                <UserIcon className="w-8 h-8 md:w-10 md:h-10 text-primary/70" />
              </div>
              <div className="space-y-1.5 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                  <Sparkles className="w-3 h-3" />
                  <span>{t("guestTitle")}</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
                  {t("guestBannerTitle")}
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("guestBannerDesc")}
                </p>
              </div>
            </div>

            {/* Right / Bottom: Action Buttons */}
            <div className="flex flex-col sm:flex-row md:flex-col items-center gap-3 w-full md:w-auto shrink-0">
              <Link
                href="/login"
                className="w-full sm:w-auto md:w-48 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-98 transition-all shadow-md shadow-primary/20"
              >
                <LogIn className="w-4 h-4" />
                <span>{t("loginBtn")}</span>
              </Link>
              <Link
                href="/join"
                className="w-full sm:w-auto md:w-48 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border border-border/80 bg-background text-foreground text-sm font-semibold hover:bg-muted transition-colors shadow-sm"
              >
                <UserPlus className="w-4 h-4 text-muted-foreground" />
                <span>{t("joinBtn")}</span>
              </Link>
            </div>
          </div>

          {/* Stats 2-Column Grid */}
          <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-border/40">
            <div className="p-4 rounded-2xl bg-card/60 border border-border/40 backdrop-blur-sm">
              <p className="text-xs text-muted-foreground mb-1 font-medium">{t("totalFavorites")}</p>
              <p className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Heart className="w-5 h-5 fill-amber-500 text-amber-500 dark:text-amber-400 dark:fill-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]" />
                <span>{favorites.length}</span>
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-card/60 border border-border/40 backdrop-blur-sm">
              <p className="text-xs text-muted-foreground mb-1 font-medium">{t("status")}</p>
              <p className="text-sm font-semibold text-foreground mt-1">
                {t("statusGuest")}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Favorite Songs Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 fill-amber-500 text-amber-500 dark:text-amber-400 dark:fill-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]" />
              <h2 className="text-2xl font-bold text-foreground font-heading">
                {t("favoriteSongs")}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t("favoriteSongsDesc")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {favorites.length > 0 && (
              <button
                type="button"
                onClick={clearFavorites}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-muted/60"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t("clearAll")}</span>
              </button>
            )}
            <Link
              href="/taize"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline px-3 py-1.5 rounded-lg bg-primary/10 transition-colors"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{t("exploreSongs")}</span>
            </Link>
          </div>
        </div>

        {/* Favorite Tracks List */}
        {favorites.length > 0 ? (
          <div className="space-y-3">
            <AnimatePresence>
              {favorites.map((track) => {
                const isThisTrackPlaying =
                  currentTrack?.id === track.id || currentTrack?.url === track.url

                return (
                  <motion.div
                    key={track.id || track.url}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-4 md:p-5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                      isThisTrackPlaying
                        ? "border-primary/50 bg-primary/5 shadow-md shadow-primary/10"
                        : "border-border/50 bg-card hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                          isThisTrackPlaying
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Disc3
                          className={`w-5 h-5 ${
                            isThisTrackPlaying && isPlaying ? "animate-spin-slow" : ""
                          }`}
                          style={{ animationDuration: "4s" }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold text-foreground truncate">
                          {track.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">{getSongCategory(track)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Filled Golden Amber Love Remove Button */}
                      <button
                        type="button"
                        onClick={() => toggleFavorite(track)}
                        className="p-2.5 rounded-full text-amber-500 dark:text-amber-400 hover:bg-amber-500/10 transition-colors"
                        title={t("remove")}
                        aria-label={t("remove")}
                      >
                        <Heart className="w-5 h-5 fill-current text-amber-500 dark:text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                      </button>

                      {/* Play Button linked specifically to the favorites queue */}
                      <button
                        type="button"
                        onClick={() => {
                          if (currentTrack?.id === track.id || currentTrack?.url === track.url) {
                            togglePlay()
                          } else {
                            play(track, favorites, "favorites")
                          }
                        }}
                        className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform shadow-md ${
                          isThisTrackPlaying && isPlaying
                            ? "bg-primary text-primary-foreground hover:opacity-90"
                            : "bg-foreground text-background hover:scale-105"
                        }`}
                        title={isThisTrackPlaying && isPlaying ? t("pause") : t("play")}
                      >
                        {isThisTrackPlaying && isPlaying ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-border/70 bg-card/40">
            <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <Music className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {t("noFavorites")}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
              Browse our praise & worship songs, tap the heart icon on any song, and it will appear here.
            </p>
            <Link
              href="/taize"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t("exploreSongs")}</span>
            </Link>
          </div>
        )}
      </div>

      {/* Danger Zone Section for Logged-In Users */}
      {user && (
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="p-6 rounded-3xl border border-destructive/20 bg-destructive/5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-destructive flex items-center gap-2">
                  <UserX className="w-4 h-4" />
                  <span>{t("deleteAccount")}</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-md">
                  {t("deleteAccountDesc")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDeleteError("")
                  setShowDeleteModal(true)
                }}
                className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground text-xs font-semibold hover:opacity-90 transition-opacity shrink-0"
              >
                {t("deleteAccount")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Selection Modal (Upload Custom Image Only) */}
      <AnimatePresence>
        {showAvatarModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold font-heading text-foreground">
                  {t("changeAvatar")}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(false)}
                  className="p-1 rounded-full text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Avatar Preview */}
              <div className="flex flex-col items-center justify-center py-4 space-y-4">
                <div className="w-28 h-28 rounded-3xl bg-muted border-2 border-primary/40 flex items-center justify-center text-4xl shadow-inner overflow-hidden">
                  {selectedAvatar ? (
                    <img
                      src={selectedAvatar}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>

                {avatarSuccessMsg ? (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-center text-sm font-semibold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{avatarSuccessMsg}</span>
                  </div>
                ) : null}

                {/* Upload Image Option */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 rounded-2xl border border-dashed border-border/80 hover:border-primary bg-muted/20 text-sm font-semibold text-foreground flex items-center justify-center gap-2 transition-colors"
                >
                  <Upload className="w-4 h-4 text-primary" />
                  <span>{t("uploadPhoto")}</span>
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  disabled={isUpdatingAvatar || !selectedAvatar}
                  onClick={handleSaveAvatar}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                >
                  {isUpdatingAvatar ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>{t("save")}</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Password Reset via Email Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold font-heading text-foreground">
                  {t("resetPasswordRequest")}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false)
                    setPasswordError("")
                    setEmailSentSuccess(false)
                  }}
                  className="p-1 rounded-full text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {emailSentSuccess ? (
                /* Success screen: Email confirmation sent */
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-4 text-center space-y-4"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                    <MailCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-foreground mb-1">
                      {t("resetEmailSentTitle")}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed px-2">
                      {t("resetEmailSentDesc", { email: user?.email || "" })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false)
                      setEmailSentSuccess(false)
                    }}
                    className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
                  >
                    {t("checkInbox")}
                  </button>
                </motion.div>
              ) : (
                /* Input form: Enter current password to request email confirmation */
                <form onSubmit={handleRequestPasswordReset} className="space-y-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("resetPasswordDesc")}
                  </p>

                  {passwordError && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  {/* Current Password Field */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      {t("currentPassword")}
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder={t("currentPasswordPlaceholder")}
                        required
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-background border border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordModal(false)
                        setPasswordError("")
                      }}
                      className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
                    >
                      {t("cancel")}
                    </button>
                    <button
                      type="submit"
                      disabled={isSendingResetEmail || !currentPassword}
                      className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                    >
                      {isSendingResetEmail ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-xs">{t("sendingEmail")}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span className="text-xs">{t("sendResetEmail")}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card border border-destructive/30 rounded-3xl p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-destructive font-bold text-lg font-heading">
                  <AlertTriangle className="w-5 h-5" />
                  <span>{t("deleteConfirmTitle")}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="p-1 rounded-full text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {deleteError ? (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-center text-sm font-semibold flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{deleteError}</span>
                </div>
              ) : null}

              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("deleteConfirmDesc")}
              </p>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  disabled={isDeletingAccount}
                  onClick={handleDeleteAccount}
                  className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                >
                  {isDeletingAccount ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>{t("confirmDelete")}</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
