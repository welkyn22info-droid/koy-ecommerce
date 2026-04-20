"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useStore, type Product } from "@/lib/store-context"
import { ProductQuickPreview } from "./product-quick-preview"

// Config visual por posición relativa al centro (-2, -1, 0, 1, 2)
const SLOT_CONFIG: Record<number, { x: number; rotateY: number; scale: number; opacity: number; zIndex: number }> = {
  [-2]: { x: -340, rotateY: 52,  scale: 0.62, opacity: 0.55, zIndex: 1 },
  [-1]: { x: -185, rotateY: 28,  scale: 0.80, opacity: 0.82, zIndex: 2 },
  [0]:  { x: 0,    rotateY: 0,   scale: 1,    opacity: 1,    zIndex: 5 },
  [1]:  { x: 185,  rotateY: -28, scale: 0.80, opacity: 0.82, zIndex: 2 },
  [2]:  { x: 340,  rotateY: -52, scale: 0.62, opacity: 0.55, zIndex: 1 },
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Obtiene los 5 productos visibles (circular) para el índice activo
function getVisibleSlots(products: Product[], activeIdx: number): Array<{ product: Product; offset: number }> {
  const n = products.length
  return [-2, -1, 0, 1, 2].map((offset) => ({
    product: products[((activeIdx + offset) % n + n) % n],
    offset,
  }))
}

interface CoverflowCardProps {
  product: Product
  offset: number
  onClick: () => void
  isActive: boolean
}

function CoverflowCard({ product, offset, onClick, isActive }: CoverflowCardProps) {
  const cfg = SLOT_CONFIG[offset]
  const [imgIdx, setImgIdx] = useState(0)
  const allImages = [product.image]

  // Cycle image every 2.5s only for center card
  useEffect(() => {
    if (!isActive) { setImgIdx(0); return }
    const t = setInterval(() => setImgIdx((i) => (i + 1) % allImages.length), 2500)
    return () => clearInterval(t)
  }, [isActive, allImages.length, product.id])

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(p)

  return (
    <motion.div
      layout
      animate={{
        x: cfg.x,
        rotateY: cfg.rotateY,
        scale: cfg.scale,
        opacity: cfg.opacity,
        zIndex: cfg.zIndex,
      }}
      transition={{ type: "spring", stiffness: 280, damping: 32 }}
      onClick={onClick}
      className="absolute cursor-pointer select-none"
      style={{ transformStyle: "preserve-3d", originX: "50%" }}
    >
      <div
        className="relative overflow-hidden rounded-2xl bg-secondary/30 shadow-2xl"
        style={{ width: 220, height: 290 }}
      >
        <AnimatePresence mode="crossfade">
          <motion.img
            key={`${product.id}-${imgIdx}`}
            src={allImages[imgIdx]}
            alt={product.name}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Category badge */}
        <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-semibold capitalize text-foreground">
          {product.category}
        </span>

        {/* Center card: show info */}
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-0 inset-x-0 p-4 text-white"
          >
            <p className="font-bold text-base leading-tight">{product.name}</p>
            <p className="text-sm text-white/80 mt-0.5">{formatPrice(product.basePrice)}</p>
            <div className="flex gap-1.5 mt-2">
              {product.colors.slice(0, 4).map((c) => (
                <span key={c.name} className="w-3.5 h-3.5 rounded-full border border-white/40" style={{ backgroundColor: c.hex }} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Side cards: subtle name */}
        {!isActive && (
          <div className="absolute bottom-3 inset-x-0 px-3">
            <p className="text-white/80 text-xs font-medium truncate text-center">{product.name}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

interface CoverflowCarouselProps {
  autoplay?: boolean
  intervalMs?: number
}

export function ImmersiveCarousel({ autoplay = true, intervalMs = 3000 }: CoverflowCarouselProps) {
  const { products } = useStore()
  const [shuffled, setShuffled] = useState<Product[]>([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Shuffle on mount
  useEffect(() => {
    if (products.length > 0) setShuffled(shuffle(products))
  }, [products])

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", handler)
    return () => window.removeEventListener("resize", handler)
  }, [])

  // Autoplay
  useEffect(() => {
    if (!autoplay || shuffled.length === 0) return
    autoplayRef.current = setInterval(() => {
      setActiveIdx((i) => (i + 1) % shuffled.length)
    }, intervalMs)
    return () => { if (autoplayRef.current) clearInterval(autoplayRef.current) }
  }, [autoplay, intervalMs, shuffled.length])

  const goTo = useCallback((idx: number) => {
    if (autoplayRef.current) clearInterval(autoplayRef.current)
    setActiveIdx(((idx % shuffled.length) + shuffled.length) % shuffled.length)
    // Restart autoplay after manual nav
    if (autoplay) {
      autoplayRef.current = setInterval(() => {
        setActiveIdx((i) => (i + 1) % shuffled.length)
      }, intervalMs)
    }
  }, [shuffled.length, autoplay, intervalMs])

  const handleCardClick = useCallback((product: Product, offset: number) => {
    if (offset === 0) {
      // Center card: open preview or navigate
      if (isMobile) {
        setPreviewProduct(product)
      } else {
        setPreviewProduct(product)
      }
    } else {
      // Side card: bring to center
      goTo(activeIdx + offset)
    }
  }, [activeIdx, goTo, isMobile])

  // Long press for mobile
  const handleTouchStart = useCallback((product: Product, offset: number) => {
    longPressRef.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(50)
      if (offset === 0) setPreviewProduct(product)
      else goTo(activeIdx + offset)
    }, 400)
  }, [activeIdx, goTo])

  const handleTouchEnd = useCallback(() => {
    if (longPressRef.current) clearTimeout(longPressRef.current)
  }, [])

  if (shuffled.length === 0) {
    return (
      <div className="flex justify-center gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-secondary/30 animate-pulse" style={{ width: 220 * [0.62, 0.80, 1, 0.80, 0.62][i], height: 290 * [0.62, 0.80, 1, 0.80, 0.62][i] }} />
        ))}
      </div>
    )
  }

  const visibleSlots = getVisibleSlots(shuffled, activeIdx)

  return (
    <div className="relative flex flex-col items-center gap-6">
      {/* Coverflow stage */}
      <div
        className="relative w-full flex items-center justify-center"
        style={{ perspective: "1100px", height: 320, perspectiveOrigin: "50% 40%" }}
      >
        {visibleSlots.map(({ product, offset }) => (
          <CoverflowCard
            key={`${product.id}-${offset}`}
            product={product}
            offset={offset}
            isActive={offset === 0}
            onClick={() => handleCardClick(product, offset)}
          />
        ))}
      </div>

      {/* Dot navigation */}
      <div className="flex gap-2 mt-2">
        {shuffled.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIdx ? "w-6 bg-foreground" : "w-1.5 bg-foreground/25"}`}
          />
        ))}
      </div>

      {/* Quick preview */}
      <AnimatePresence>
        {previewProduct && (
          <ProductQuickPreview
            product={previewProduct}
            onClose={() => setPreviewProduct(null)}
            isMobile={isMobile}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
