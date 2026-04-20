"use client"

import { SlidersHorizontal, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store-context"
import { ProductCard } from "@/components/product-card"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function CatalogView() {
  const { products, categoryFilter, setCategoryFilter } = useStore()
  const [sizeFilter, setSizeFilter] = useState<string | null>(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const filteredProducts = products.filter((product) => {
    if (categoryFilter && product.category !== categoryFilter) return false
    if (sizeFilter && !product.sizes.includes(sizeFilter)) return false
    return true
  })

  const allSizes = ["S", "M", "L", "XL"]

  const clearFilters = () => {
    setCategoryFilter(null)
    setSizeFilter(null)
  }

  const hasActiveFilters = categoryFilter || sizeFilter

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h3 className="font-semibold mb-3">Categoría</h3>
        <div className="space-y-2">
          <button
            onClick={() => setCategoryFilter(null)}
            className={cn(
              "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
              !categoryFilter
                ? "bg-foreground text-background"
                : "hover:bg-secondary"
            )}
          >
            Todos
          </button>
          <button
            onClick={() => setCategoryFilter("anime")}
            className={cn(
              "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
              categoryFilter === "anime"
                ? "bg-foreground text-background"
                : "hover:bg-secondary"
            )}
          >
            Anime
          </button>
          <button
            onClick={() => setCategoryFilter("cine")}
            className={cn(
              "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
              categoryFilter === "cine"
                ? "bg-foreground text-background"
                : "hover:bg-secondary"
            )}
          >
            Cine
          </button>
        </div>
      </div>

      {/* Size Filter */}
      <div>
        <h3 className="font-semibold mb-3">Tallas</h3>
        <div className="flex flex-wrap gap-2">
          {allSizes.map((size) => (
            <button
              key={size}
              onClick={() => setSizeFilter(sizeFilter === size ? null : size)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm border transition-colors",
                sizeFilter === size
                  ? "bg-foreground text-background border-foreground"
                  : "hover:bg-secondary border-border"
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={clearFilters}
          className="w-full gap-2"
        >
          <X className="h-4 w-4" />
          Limpiar Filtros
        </Button>
      )}
    </div>
  )

  return (
    <div className="container px-4 md:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {categoryFilter === "anime"
              ? "Colección Anime"
              : categoryFilter === "cine"
              ? "Colección Cine"
              : "Catálogo"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {filteredProducts.length} productos
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <Button
          variant="outline"
          className="md:hidden gap-2"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
          {hasActiveFilters && (
            <span className="ml-1 px-1.5 py-0.5 bg-foreground text-background text-xs rounded-full">
              {[categoryFilter, sizeFilter].filter(Boolean).length}
            </span>
          )}
        </Button>
      </div>

      {/* Mobile Filters */}
      {showMobileFilters && (
        <div className="md:hidden mb-8 p-4 bg-secondary/30 rounded-xl">
          <FilterContent />
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-24">
            <div className="flex items-center gap-2 mb-6">
              <SlidersHorizontal className="h-4 w-4" />
              <h2 className="font-semibold">Filtros</h2>
            </div>
            <FilterContent />
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-4">
                No se encontraron productos con los filtros seleccionados.
              </p>
              <Button onClick={clearFilters}>Ver todos los productos</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
