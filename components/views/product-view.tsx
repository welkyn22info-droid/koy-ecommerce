"use client"

import { ArrowLeft, Check, ShoppingBag, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore, type Product } from "@/lib/store-context"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface ProductViewProps {
  productId: string
}

export function ProductView({ productId }: ProductViewProps) {
  const { products, setCurrentView, addToCart } = useStore()
  const product = products.find((p) => p.id === productId)

  const [selectedSize, setSelectedSize] = useState(product?.sizes[1] || "M")
  const [selectedColor, setSelectedColor] = useState(
    product?.colors[0] || { name: "Negro", hex: "#1a1a1a" }
  )
  const [selectedDesign, setSelectedDesign] = useState(
    product?.designs[0] || { id: "1", name: "Default", image: "" }
  )
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  if (!product) {
    return (
      <div className="container px-4 md:px-6 py-20 text-center">
        <p className="text-muted-foreground mb-4">Producto no encontrado</p>
        <Button onClick={() => setCurrentView("catalog")}>
          Volver al catálogo
        </Button>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleAddToCart = () => {
    setIsAdding(true)
    
    const cartItem = {
      id: `${product.id}-${selectedSize}-${selectedColor.name}-${selectedDesign.id}-${Date.now()}`,
      product,
      size: selectedSize,
      color: selectedColor,
      design: selectedDesign,
      quantity,
    }
    
    addToCart(cartItem)
    
    setTimeout(() => setIsAdding(false), 1500)
  }

  return (
    <div className="container px-4 md:px-6 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => setCurrentView("catalog")}
        className="mb-8 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al catálogo
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-secondary/30">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-secondary/30 overflow-hidden cursor-pointer border-2 border-transparent hover:border-foreground transition-colors"
              >
                <img
                  src={product.image}
                  alt={`${product.name} view ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-8">
          <div>
            <span className="text-sm text-muted-foreground uppercase tracking-wider">
              {product.category === "anime" ? "Colección Anime" : "Colección Cine"}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold mt-2">
              {product.name}
            </h1>
            <p className="text-2xl font-semibold mt-4">
              {formatPrice(product.basePrice)}
            </p>
          </div>

          {/* Size Selector */}
          <div>
            <h3 className="font-semibold mb-3">Talla</h3>
            <div className="flex gap-3">
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
          <div>
            <h3 className="font-semibold mb-3">
              Color del Buzo:{" "}
              <span className="font-normal text-muted-foreground">
                {selectedColor.name}
              </span>
            </h3>
            <div className="flex gap-3">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all",
                    selectedColor.name === color.name
                      ? "ring-2 ring-foreground ring-offset-2"
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

          {/* Design Selector */}
          <div>
            <h3 className="font-semibold mb-3">Diseño del Estampado</h3>
            <div className="grid grid-cols-2 gap-3">
              {product.designs.map((design) => (
                <button
                  key={design.id}
                  onClick={() => setSelectedDesign(design)}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all",
                    selectedDesign.id === design.id
                      ? "border-foreground bg-secondary/50"
                      : "border-border hover:border-foreground/50"
                  )}
                >
                  <div className="aspect-video rounded-lg bg-secondary/50 mb-2 flex items-center justify-center">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <span className="font-medium">{design.name}</span>
                </button>
              ))}
            </div>
          </div>

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
