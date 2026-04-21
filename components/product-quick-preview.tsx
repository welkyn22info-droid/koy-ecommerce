"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ShoppingBag, ZoomIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore, type Product } from "@/lib/store-context"

interface ProductQuickPreviewProps {
  product: Product
  onClose: () => void
  isMobile?: boolean
}

export function ProductQuickPreview({ product, onClose, isMobile = false }: ProductQuickPreviewProps) {
  const { addToCart, setCurrentView } = useStore()
  const [selectedColor, setSelectedColor] = useState(product.colors[0])
  const [selectedSize, setSelectedSize] = useState(product.sizes[1] ?? product.sizes[0])
  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const [added, setAdded] = useState(false)

  const images = [product.image, ...product.colors.map((c) => c.image).filter((img): img is string => !!img && img.startsWith("http"))]
  const activeImage = images[activeImageIdx] ?? product.image

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(p)

  const handleAddToCart = () => {
    addToCart({
      id: `${product.id}-${Date.now()}`,
      product,
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
    })
    setAdded(true)
    setTimeout(() => { setAdded(false); onClose() }, 1200)
  }

  const content = (
    <div className="flex flex-col md:flex-row gap-4 p-4" style={{ maxWidth: isMobile ? "100%" : 380 }}>
      {/* Image strip */}
      <div className="flex flex-col gap-2">
        <div className="w-full md:w-36 aspect-[3/4] rounded-xl overflow-hidden bg-secondary/30 flex-shrink-0">
          <img src={activeImage} alt={product.name} className="w-full h-full object-cover" />
        </div>
        {images.length > 1 && (
          <div className="flex gap-1.5 justify-center">
            {images.slice(0, 4).map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImageIdx(i)}
                className={`w-8 h-8 rounded-md overflow-hidden border-2 transition-colors ${activeImageIdx === i ? "border-foreground" : "border-transparent"}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col gap-3 flex-1">
        <div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{product.category}</span>
          <h3 className="font-bold text-lg leading-tight mt-0.5">{product.name}</h3>
          <p className="text-xl font-bold mt-1">{formatPrice(product.basePrice)}</p>
        </div>

        {/* Colors */}
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">Color: <span className="text-foreground font-medium">{selectedColor.name}</span></p>
          <div className="flex gap-2 flex-wrap">
            {product.colors.map((c) => (
              <button
                key={c.name}
                onClick={() => setSelectedColor(c)}
                title={c.name}
                className={`w-6 h-6 rounded-full border-2 transition-all ${selectedColor.name === c.name ? "border-foreground scale-110" : "border-border/50"}`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>

        {/* Sizes */}
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">Talla</p>
          <div className="flex gap-1.5 flex-wrap">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSize(s)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${selectedSize === s ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground/50"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2 mt-auto pt-2">
          <Button onClick={handleAddToCart} className="w-full gap-2" disabled={added}>
            <ShoppingBag className="h-4 w-4" />
            {added ? "¡Añadido al carrito!" : "Añadir al carrito"}
          </Button>
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => { setCurrentView(`product-${product.id}`); onClose() }}
          >
            <ZoomIn className="h-4 w-4" />
            Personalizar
          </Button>
        </div>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl shadow-2xl overflow-y-auto max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Vista Rápida</h3>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          {content}
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 8 }}
      transition={{ duration: 0.18 }}
      className="absolute z-50 bg-background border rounded-2xl shadow-2xl overflow-hidden"
      style={{ top: "50%", left: "calc(100% + 12px)", transform: "translateY(-50%)", minWidth: 360 }}
      onClick={(e) => e.stopPropagation()}
    >
      <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-secondary transition-colors z-10">
        <X className="h-4 w-4" />
      </button>
      {content}
    </motion.div>
  )
}
