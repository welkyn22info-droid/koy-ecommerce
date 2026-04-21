"use client"

import { ArrowLeft, Check, ShoppingBag, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store-context"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface ProductViewProps {
  productId: string
}

export function ProductView({ productId }: ProductViewProps) {
  const { products, setCurrentView, addToCart } = useStore()
  const product = products.find((p) => p.id === productId)

  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || "M")
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] || { name: "Negro", hex: "#1a1a1a" })
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  if (!product) {
    return (
      <div className="container px-4 md:px-6 py-20 text-center">
        <p className="text-muted-foreground mb-4">Producto no encontrado</p>
        <Button onClick={() => setCurrentView("catalog")}>Volver al catálogo</Button>
      </div>
    )
  }

  const displayImage = selectedColor.image || product.image

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(price)

  const handleAddToCart = () => {
    setIsAdding(true)
    addToCart({
      id: `${product.id}-${selectedSize}-${selectedColor.name}-${Date.now()}`,
      product,
      size: selectedSize,
      color: selectedColor,
      quantity,
    })
    setTimeout(() => setIsAdding(false), 1500)
  }

  return (
    <div className="container px-4 md:px-6 py-8">
      <Button variant="ghost" onClick={() => setCurrentView("catalog")} className="mb-8 gap-2">
        <ArrowLeft className="h-4 w-4" />
        Volver al catálogo
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-secondary/30">
            <img
              src={displayImage}
              alt={`${product.name} — ${selectedColor.name}`}
              className="w-full h-full object-cover transition-all duration-300"
            />
          </div>
          {/* Color thumbnails */}
          {product.colors.some((c) => c.image) && (
            <div className="grid grid-cols-4 gap-3">
              {product.colors.filter((c) => c.image).map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "aspect-square rounded-lg overflow-hidden border-2 transition-all",
                    selectedColor.name === color.name
                      ? "border-foreground"
                      : "border-transparent hover:border-foreground/40"
                  )}
                >
                  <img src={color.image} alt={color.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-8">
          <div>
            <span className="text-sm text-muted-foreground uppercase tracking-wider">
              {product.category === "anime" ? "Colección Anime" : "Colección Cine"}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold mt-2">{product.name}</h1>
            <p className="text-2xl font-semibold mt-4">{formatPrice(product.basePrice)}</p>
          </div>

          {/* Size Selector */}
          <div>
            <h3 className="font-semibold mb-3">Talla</h3>
            <div className="flex gap-3 flex-wrap">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "w-14 h-14 rounded-lg border-2 font-medium transition-all",
                    selectedSize === size
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          {product.colors.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">
                Color:{" "}
                <span className="font-normal text-muted-foreground">{selectedColor.name}</span>
              </h3>
              <div className="flex gap-3 flex-wrap">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all",
                      selectedColor.name === color.name
                        ? "ring-2 ring-foreground ring-offset-2 border-transparent"
                        : "border-border/50 hover:scale-110"
                    )}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {selectedColor.name === color.name && (
                      <Check
                        className={cn(
                          "h-5 w-5",
                          color.hex === "#f5f5f5" || color.hex === "#fbbf24"
                            ? "text-foreground"
                            : "text-background"
                        )}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h3 className="font-semibold mb-3">Cantidad</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-secondary transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-secondary transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-muted-foreground">
                Total: {formatPrice(product.basePrice * quantity)}
              </span>
            </div>
          </div>

          {/* Add to Cart */}
          <Button
            size="lg"
            className="w-full gap-2 h-14 text-lg"
            onClick={handleAddToCart}
            disabled={isAdding}
          >
            {isAdding ? (
              <>
                <Check className="h-5 w-5" />
                ¡Añadido al carrito!
              </>
            ) : (
              <>
                <ShoppingBag className="h-5 w-5" />
                Añadir al Carrito
              </>
            )}
          </Button>

          {/* Product Details */}
          <div className="border-t pt-8 space-y-4">
            <h3 className="font-semibold">Detalles del Producto</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Buzo oversized con corte moderno</li>
              <li>• 100% algodón premium de 350g</li>
              <li>• Estampado DTF de alta durabilidad</li>
              <li>• Lavable a máquina (agua fría)</li>
              <li>• Diseño exclusivo impreso bajo demanda</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
