import { RegistrationForm } from "@/components/RegistrationForm"
import { Heart, Users, Calendar, Music } from "lucide-react"

const HIGHLIGHTS = [
  { icon: Heart, label: "靈修陪伴", desc: "泰澤音樂、玫瑰經與每週祈禱聚會" },
  { icon: Users, label: "青年社群", desc: "一個充滿溫度的華語天主教大家庭" },
  { icon: Calendar, label: "豐富活動", desc: "退省、慶典、生活技能工作坊" },
  { icon: Music, label: "全人成長", desc: "從信仰到財商，陪你走過大學四年" },
]

export default function JoinPage() {
  return (
    <div className="relative min-h-screen">
      {/* Atmospheric background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium uppercase tracking-widest text-primary mb-4">Mandarin Care Group · UTM</p>
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-6 leading-tight">
            歡迎加入<br />
            <span className="bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent">
              我們的大家庭
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            無論您是剛入學的新生、尋找信仰群體的你，還是想了解我們的朋友，填寫以下表單，我們的執委會將在最短時間內與您聯繫！
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          {/* Left: Highlights */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-semibold text-foreground mb-8">加入 MCG，您將獲得…</h2>
            {HIGHLIGHTS.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{label}</p>
                  <p className="text-muted-foreground text-sm mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-3">
            <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 shadow-2xl">
              {/* Subtle inner glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              <h2 className="text-xl font-semibold text-foreground mb-6">填寫您的資料</h2>
              <RegistrationForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
