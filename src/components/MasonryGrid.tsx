"use client"

import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CldImage } from "next-cloudinary"
import { X, PlayCircle } from "lucide-react"

interface GalleryImage {
  id: string
  title: string
  url: string
  date: string
  tags: string[]
  type: "image" | "video"
  alt?: string
}

export function MasonryGrid({ images }: { images: GalleryImage[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  if (!images || images.length === 0) {
    return <p className="text-center text-muted-foreground py-20">相簿中還沒有照片或影片喔！快去 Notion 新增吧。</p>
  }

  const selectedImage = images.find((img) => img.id === selectedId)

  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {images.map((img) => (
          <motion.div
            key={img.id}
            layoutId={`photo-${img.id}`}
            className="relative rounded-2xl overflow-hidden group bg-muted cursor-zoom-in break-inside-avoid"
            onClick={() => setSelectedId(img.id)}
            onMouseEnter={() => setHoveredId(img.id)}
            onMouseLeave={() => setHoveredId(null)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {img.type === "video" ? (
              <video
                src={img.url}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <CldImage
                src={img.url}
                alt={img.alt ?? img.title}
                width={800}
                height={800}
                preserveTransformations
                crop="limit"
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
            
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: hoveredId === img.id ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {img.type === "video" && (
                <PlayCircle className="w-8 h-8 text-white/80 mb-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              )}
              <h3 className="text-white font-semibold text-lg">{img.title}</h3>
              <p className="text-white/80 text-sm">{img.date}</p>
            </motion.div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedId && selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md p-4 md:p-12"
            onClick={() => setSelectedId(null)}
          >
            <button
              className="absolute top-6 right-6 text-foreground/50 hover:text-foreground bg-background/50 backdrop-blur-sm p-2 rounded-full transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedId(null)
              }}
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div
              layoutId={`photo-${selectedId}`}
              className="relative w-full h-full max-w-6xl max-h-[80vh] overflow-hidden rounded-xl shadow-2xl flex justify-center items-center"
              onClick={(e) => e.stopPropagation()} // Prevent clicking video/image from closing lightbox
            >
              {selectedImage.type === "video" ? (
                <video
                  src={selectedImage.url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <CldImage
                  src={selectedImage.url}
                  alt={selectedImage.alt ?? selectedImage.title}
                  width={1920}
                  height={1080}
                  preserveTransformations
                  crop="limit"
                  className="w-full h-full object-contain"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
