"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useTranslations } from "next-intl"

export function RosaryGuide() {
  const t = useTranslations("RosaryGuide")
  const [step, setStep] = React.useState(0)
  const [direction, setDirection] = React.useState(0) // -1 for left, 1 for right

   const ROSARY_STEPS = t.raw("prayers") as {
    id: number
    title: string
    content: string
  }[]

  const paginate = (newDirection: number) => {
    const newStep = step + newDirection
    if (newStep >= 0 && newStep < ROSARY_STEPS.length) {
      setDirection(newDirection)
      setStep(newStep)
    }
  }

  const variants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 300 : -300,
        opacity: 0
      }
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 300 : -300,
        opacity: 0
      }
    }
  }

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto h-[600px] bg-card rounded-3xl shadow-xl border border-border/50 overflow-hidden relative">
      
      {/* Bead Progress Indicator */}
      <div className="w-full pt-8 pb-4 px-6 flex justify-center gap-1.5 z-10 bg-gradient-to-b from-card to-card/0">
        {ROSARY_STEPS.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-500 ${
              i === step
                ? "w-4 h-4 bg-primary shadow-lg shadow-primary/30"
                : i < step
                ? "w-3 h-3 bg-primary/40"
                : "w-3 h-3 bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Swipeable Content */}
      <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden px-8">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x)
              if (swipe < -swipeConfidenceThreshold) {
                paginate(1) // swipe left goes to next
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1) // swipe right goes to prev
              }
            }}
            className="absolute w-full h-full flex flex-col items-center justify-center text-center cursor-grab active:cursor-grabbing px-6"
          >
            <div className="bg-primary/5 w-20 h-20 rounded-full flex items-center justify-center mb-8 border border-primary/20">
              <span className="text-2xl font-serif text-primary">{step + 1}</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-6 font-heading">
              {ROSARY_STEPS[step].title}
            </h2>
            <p className="text-lg text-muted-foreground whitespace-pre-wrap leading-relaxed font-serif">
              {ROSARY_STEPS[step].content}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons (for desktop or explicit clicking) */}
      <div className="w-full flex justify-between p-6 z-10 bg-gradient-to-t from-card to-card/0">
        <button
          onClick={() => paginate(-1)}
          disabled={step === 0}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-muted text-muted-foreground disabled:opacity-30 transition-colors hover:bg-muted/80"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center justify-center">
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">{t("swipe")}</span>
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">{step + 1}/{ROSARY_STEPS.length}</span>
        </div>
        <button
          onClick={() => paginate(1)}
          disabled={step === ROSARY_STEPS.length - 1}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-primary text-primary-foreground shadow-md disabled:opacity-30 transition-transform hover:scale-105"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}

const swipeConfidenceThreshold = 10000
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity
}
