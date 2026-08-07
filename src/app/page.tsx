import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-16 px-4 text-center">
      <div className="max-w-3xl mx-auto mb-10">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 block">
          Mandarin Care Group · UTM
        </span>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-foreground font-heading">
          MCG UTM
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-[800px] mb-8 leading-relaxed">
          A digital sanctuary and modern gallery for the Mandarin Care Group.
        </p>

        {/* Action Buttons for Login & Registration */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.97] transition-all duration-200 shadow-md"
          >
            <LogIn className="w-4 h-4" />
            <span>登入 Login</span>
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border bg-card text-foreground font-semibold text-sm hover:bg-accent hover:text-accent-foreground active:scale-[0.97] transition-all duration-200 shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>註冊 Register</span>
          </Link>
        </div>
      </div>

      <div className="w-full max-w-5xl aspect-video bg-muted/30 rounded-xl border border-border/50 flex items-center justify-center shadow-lg">
        <span className="text-muted-foreground text-sm uppercase tracking-widest">
          High Quality Group Photo Placeholder
        </span>
      </div>
    </div>
  );
}
