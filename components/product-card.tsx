"use client"

import { ShoppingBag, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore, type Product } from "@/lib/store-context"
import { useState } from "react"

interface ProductCardProps {
  product: Product
  showQuickAdd?: boolean
}

export function ProductCard({ product, showQuickAdd = true }: ProductCardProps) {
  const { setCurrentView, addToCart } = useStore()
  const [isAdding, setIsAdding] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsAdding(true)
    
    const cartItem = {
      id: `${product.id}-${Date.now()}`,
      product,
      size: product.sizes[1] || product.sizes[0],
      color: product.colors[0],
      quantity: 1,
    }
    
    addToCart(cartItem)
    
    setTimeout(() => setIsAdding(false), 1000)
  }

  const handleClick = () => {
    setCurrentView(`product-${product.id}`)
  }

  return (
    <div
      className="group cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-secondary/30 mb-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {showQuickAdd && (
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <Button
              onClick={handleQuickAdd}
              className="w-full gap-2"
              disabled={isAdding}
            >
              {isAdding ? (
                "¡Añadido!"
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Añadir al Carrito
                </>
              )}
            </Button>
          </div>
        )}
        <span className="absolute top-3 left-3 px-2 py-1 bg-background/90 rounded-md text-xs font-medium capitalize">
          {product.category}
        </span>
      </div>
      <div className="space-y-1">
        <h3 className="font-medium group-hover:underline underline-offset-4">
          {product.name}
        </h3>
        <p className="text-muted-foreground">
          {formatPrice(product.basePrice)}
        </p>
        <div className="flex gap-1 pt-1">
          {product.colors.slice(0, 4).map((color) => (
            <span
              key={color.name}
              className="w-4 h-4 rounded-full border border-border/50"
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
          {product.colors.length > 4 && (
            <span className="text-xs text-muted-foreground">
              +{product.colors.length - 4}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
