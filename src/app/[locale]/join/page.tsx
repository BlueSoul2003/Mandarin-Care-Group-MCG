import { RegistrationForm } from "@/components/RegistrationForm"
import { Heart, Users, Calendar, Music } from "lucide-react"
import { useTranslations } from "next-intl"

export default function JoinPage() {
  const t = useTranslations("JoinPage")
  
  const highlights = t.raw("highlights") as {
    label: string
    desc: string
  }[]

  // Map the icons sequentially
  const ICONS = [Heart, Users, Calendar, Music]

  return (
    <div className="relative min-h-screen">
      {/* Atmospheric background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium uppercase tracking-widest text-primary mb-4">Mandarin Care Group · UTM</p>
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-6 leading-tight whitespace-pre-wrap">
            {t("title")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {t("description")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          {/* Left: Highlights */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-semibold text-foreground mb-8">{t("highlightsTitle")}</h2>
            {highlights.map((item, index) => {
              const Icon = ICONS[index % ICONS.length]
              return (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{item.label}</p>
                    <p className="text-muted-foreground text-sm mt-0.5">{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-3">
            <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 shadow-2xl">
              {/* Subtle inner glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              <h2 className="text-xl font-semibold text-foreground mb-6">{t("formTitle")}</h2>
              <RegistrationForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
