"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useStore, type Product } from "@/lib/store-context"
import { ProductQuickPreview } from "./product-quick-preview"

function TiltCard({ product, onQuickPreview }: { product: Product; onQuickPreview: (p: Product) => void }) {
  const { setCurrentView } = useStore()
  const cardRef = useRef<HTMLDivElement>(null)
  const [activeDesignIdx, setActiveDesignIdx] = useState(0)
  const [hoverTimeout, setHoverTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [longPressTimeout, setLongPressTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 })
  const scale = useSpring(1, { stiffness: 300, damping: 30 })

  // Cycle through product images every 2.5s
  const allImages = [product.image, ...product.designs.map((d) => d.image).filter((img) => img.startsWith("http"))]

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", handler)
    return () => window.removeEventListener("resize", handler)
  }, [])

  useEffect(() => {
    if (allImages.length <= 1) return
    const interval = setInterval(() => {
      setActiveDesignIdx((i) => (i + 1) % allImages.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [allImages.length])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }, [mouseX, mouseY])

  const handleMouseEnter = useCallback(() => {
    scale.set(1.03)
    const t = setTimeout(() => setShowPreview(true), 450)
    setHoverTimeout(t)
  }, [scale])

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0)
    mouseY.set(0)
    scale.set(1)
    if (hoverTimeout) clearTimeout(hoverTimeout)
    setShowPreview(false)
  }, [mouseX, mouseY, scale, hoverTimeout])

  const handleTouchStart = useCallback(() => {
    const t = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(50)
      onQuickPreview(product)
    }, 600)
    setLongPressTimeout(t)
  }, [product, onQuickPreview])

  const handleTouchEnd = useCallback(() => {
    if (longPressTimeout) clearTimeout(longPressTimeout)
  }, [longPressTimeout])

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(p)

  return (
    <div className="relative" style={{ perspective: 1000 }}>
      <motion.div
        ref={cardRef}
        style={{ rotateX, rotateY, scale, transformStyle: "preserve-3d" }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchEnd}
        onClick={() => !isMobile && setCurrentView(`product-${product.id}`)}
        className="cursor-pointer select-none"
      >
        {/* Card image */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary/30">
          <AnimatePresence mode="crossfade">
            <motion.img
              key={activeDesignIdx}
              src={allImages[activeDesignIdx]}
              alt={product.name}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>

          {/* Shimmer overlay on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none"
            style={{ opacity: useTransform(scale, [1, 1.03], [0, 1]) }}
          />

          {/* Category badge */}
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-background/90 backdrop-blur-sm rounded-lg text-xs font-semibold capitalize z-10">
            {product.category}
          </span>

          {/* Image dots indicator */}
          {allImages.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1 z-10">
              {allImages.slice(0, 4).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-300 ${activeDesignIdx === i ? "w-4 bg-white" : "w-1 bg-white/50"}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-3 space-y-1 px-1">
          <h3 className="font-semibold text-sm leading-tight">{product.name}</h3>
          <p className="font-bold">{formatPrice(product.basePrice)}</p>
          <div className="flex gap-1.5 pt-0.5">
            {product.colors.slice(0, 5).map((c) => (
              <span
                key={c.name}
                className="w-3.5 h-3.5 rounded-full border border-border/50"
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Desktop quick preview */}
      <AnimatePresence>
        {showPreview && !isMobile && (
          <ProductQuickPreview product={product} onClose={() => setShowPreview(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

export function ImmersiveCarousel({ products }: { products: Product[] }) {
  const [mobilePreviewProduct, setMobilePreviewProduct] = useState<Product | null>(null)
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", slidesToScroll: 1 },
    [Autoplay({ delay: 4000, stopOnInteraction: true })]
  )

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  if (!products.length) return null

  return (
    <div className="relative">
      {/* Navigation arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-10 h-10 rounded-full bg-background border shadow-lg flex items-center justify-center hover:bg-secondary transition-colors hidden md:flex"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-10 h-10 rounded-full bg-background border shadow-lg flex items-center justify-center hover:bg-secondary transition-colors hidden md:flex"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Carousel */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex gap-4 md:gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-none w-[70vw] sm:w-[45vw] md:w-[calc(20%-12px)] lg:w-[calc(20%-14px)]"
              style={{ minWidth: 0 }}
            >
              <TiltCard product={product} onQuickPreview={setMobilePreviewProduct} />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile long-press preview */}
      <AnimatePresence>
        {mobilePreviewProduct && (
          <ProductQuickPreview
            product={mobilePreviewProduct}
            onClose={() => setMobilePreviewProduct(null)}
            isMobile
          />
        )}
      </AnimatePresence>
    </div>
  )
}
