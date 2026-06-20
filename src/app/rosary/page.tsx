import { RosaryGuide } from "@/components/RosaryGuide"

export default function RosaryPage() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-20 max-w-4xl min-h-[calc(100vh-10rem)] flex flex-col">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">Mobile Rosary</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          專為手機單手操作設計的互動玫瑰經。滑動螢幕即可切換經文，跟著虛擬念珠的進度，專注於祈禱之中。
        </p>
      </div>

      <div className="flex-1 w-full flex items-center justify-center">
        <RosaryGuide />
      </div>
    </div>
  )
}
