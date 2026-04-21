"use client"

import { useState, useRef } from "react"
import {
  LayoutDashboard, Package, ShoppingCart, ArrowLeft, Plus,
  Search, MoreHorizontal, Edit, Trash2, X, Clock, Truck,
  CheckCircle, Home, GripVertical, ImageIcon, Star, StarOff, Loader2,
} from "lucide-react"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { useStore, type Order, type Color } from "@/lib/store-context"
import { uploadImageToCloudinary } from "@/lib/supabase"
import { cn } from "@/lib/utils"

type AdminTab = "dashboard" | "products" | "orders" | "home-cms"

const SIZES_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"]

interface ProductForm {
  name: string
  price: string
  category: "anime" | "cine"
  sizes: string[]
  colors: Color[]
  image: string
}

interface ColorDraft {
  name: string
  hex: string
  image: string
}

const EMPTY_FORM: ProductForm = {
  name: "",
  price: "",
  category: "anime",
  sizes: ["S", "M", "L", "XL"],
  colors: [],
  image: "",
}

const EMPTY_COLOR: ColorDraft = { name: "", hex: "#1a1a1a", image: "" }

// ── Image Uploader ────────────────────────────────────────────────────────────
function ImageUploader({ value, onChange, label }: { value: string; onChange: (url: string) => void; label: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState(value)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImageToCloudinary(file)
      onChange(url)
      setUrlInput(url)
      toast.success("Imagen subida correctamente")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al subir imagen"
      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="border-2 border-dashed rounded-xl overflow-hidden">
        {value ? (
          <div className="relative">
            <img src={value} alt="Preview" className="w-full h-40 object-cover" />
            <button
              onClick={() => { onChange(""); setUrlInput("") }}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-background/90 hover:bg-background transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div
            className="p-8 text-center cursor-pointer hover:bg-secondary/30 transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 mx-auto text-muted-foreground animate-spin mb-2" />
            ) : (
              <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            )}
            <p className="text-sm text-muted-foreground">
              {uploading ? "Subiendo..." : "Haz clic para subir una imagen"}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">o pega una URL abajo</p>
          </div>
        )}
      </div>
      <Input
        placeholder="https://... (pega URL directamente)"
        value={urlInput}
        onChange={(e) => { setUrlInput(e.target.value); onChange(e.target.value) }}
      />
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
          Para subir imágenes, configura Cloudinary en .env.local. Por ahora usa URLs directas.
        </p>
      )}
    </div>
  )
}

// ── Home CMS View ─────────────────────────────────────────────────────────────
function HomeCMSView() {
  const { homeConfig, updateHomeConfig, publishHomeConfig, isPublishing, products } = useStore()
  const [orderedIds, setOrderedIds] = useState<string[]>(homeConfig.featuredProductIds)

  const toggleFeatured = (productId: string) => {
    const current = orderedIds
    if (current.includes(productId)) {
      const next = current.filter((id) => id !== productId)
      setOrderedIds(next)
      updateHomeConfig({ featuredProductIds: next })
    } else if (current.length < 5) {
      const next = [...current, productId]
      setOrderedIds(next)
      updateHomeConfig({ featuredProductIds: next })
    } else {
      toast.warning("Máximo 5 productos destacados")
    }
  }

  const handleReorder = (newOrder: string[]) => {
    setOrderedIds(newOrder)
    updateHomeConfig({ featuredProductIds: newOrder })
  }

  const handlePublish = async () => {
    updateHomeConfig({ featuredProductIds: orderedIds })
    await publishHomeConfig()
    toast.success("Home actualizado correctamente", { description: "Los cambios ya son visibles para todos los usuarios." })
  }

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(p)

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold">Gestión del Home (CMS)</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Edita el contenido de la página de inicio sin tocar código. Los cambios se aplican al publicar.
        </p>
      </div>

      {/* ── Hero Banner ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hero Banner</CardTitle>
          <CardDescription>El bloque principal que ven los visitantes al entrar al sitio.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Título Principal</Label>
              <Input
                value={homeConfig.heroTitle}
                onChange={(e) => updateHomeConfig({ heroTitle: e.target.value })}
                placeholder="Ej: Viste tu pasión por el anime y el cine"
              />
            </div>
            <div className="space-y-2">
              <Label>Texto del Botón (CTA)</Label>
              <Input
                value={homeConfig.heroCTAText}
                onChange={(e) => updateHomeConfig({ heroCTAText: e.target.value })}
                placeholder="Ej: Explorar Colección"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Subtítulo</Label>
            <Textarea
              value={homeConfig.heroSubtitle}
              onChange={(e) => updateHomeConfig({ heroSubtitle: e.target.value })}
              placeholder="Descripción breve del negocio..."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Enlace del CTA</Label>
              <Select
                value={homeConfig.heroCTALink}
                onValueChange={(v) => updateHomeConfig({ heroCTALink: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="catalog">Catálogo completo</SelectItem>
                  <SelectItem value="catalog-anime">Catálogo Anime</SelectItem>
                  <SelectItem value="catalog-cine">Catálogo Cine</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tema de Temporada</Label>
              <Select
                value={homeConfig.theme}
                onValueChange={(v) => updateHomeConfig({ theme: v as typeof homeConfig.theme })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Normal</SelectItem>
                  <SelectItem value="christmas">Navidad 🎄</SelectItem>
                  <SelectItem value="halloween">Halloween 🎃</SelectItem>
                  <SelectItem value="premiere">Estreno 🎬</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <ImageUploader
            label="Imagen de Fondo del Hero"
            value={homeConfig.heroBgImage}
            onChange={(url) => updateHomeConfig({ heroBgImage: url })}
          />
        </CardContent>
      </Card>

      {/* ── Featured Products ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Productos Destacados del Home</CardTitle>
          <CardDescription>
            Selecciona hasta 5 productos para el carrusel principal.
            Arrastra para cambiar el orden de aparición.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Selected order (drag) */}
          {orderedIds.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Orden actual ({orderedIds.length}/5)
              </Label>
              <Reorder.Group axis="y" values={orderedIds} onReorder={handleReorder} className="space-y-2">
                {orderedIds.map((id) => {
                  const p = products.find((pr) => pr.id === id)
                  if (!p) return null
                  return (
                    <Reorder.Item key={id} value={id} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl cursor-grab active:cursor-grabbing">
                      <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      <span className="text-sm font-medium flex-1 truncate">{p.name}</span>
                      <span className="text-sm text-muted-foreground">{formatPrice(p.basePrice)}</span>
                      <button onClick={() => toggleFeatured(id)} className="p-1 hover:text-destructive transition-colors">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </Reorder.Item>
                  )
                })}
              </Reorder.Group>
            </div>
          )}

          {/* All products table */}
          <div className="border rounded-xl overflow-hidden">
            <div className="p-3 bg-secondary/20 border-b">
              <p className="text-xs font-medium text-muted-foreground">Todos los productos — haz clic en la estrella para destacar</p>
            </div>
            <div className="divide-y">
              {products.map((p) => {
                const isFeatured = orderedIds.includes(p.id)
                return (
                  <div key={p.id} className={cn("flex items-center gap-3 p-3 hover:bg-secondary/20 transition-colors", isFeatured && "bg-yellow-50/50")}>
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{p.category} · {formatPrice(p.basePrice)}</p>
                    </div>
                    <button
                      onClick={() => toggleFeatured(p.id)}
                      className={cn("p-1.5 rounded-lg transition-colors", isFeatured ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground hover:text-foreground")}
                    >
                      {isFeatured ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Preview note ── */}
      <Card className="border-dashed">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground text-center">
            Los cambios que hagas aquí se reflejan en tiempo real en el Home mientras navegas.
            Al hacer clic en <strong>"Publicar Cambios"</strong> se guardan en Supabase y persisten para todos.
          </p>
        </CardContent>
      </Card>

      {/* ── Publish button ── */}
      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={handlePublish}
          disabled={isPublishing}
          className="gap-2 px-8 rounded-xl"
        >
          {isPublishing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Publicando...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Publicar Cambios
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// ── Main Admin View ───────────────────────────────────────────────────────────
export function AdminView() {
  const { setCurrentView, products, orders, updateOrderStatus, createProduct, updateProduct, deleteProduct } = useStore()
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard")
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM)
  const [colorDraft, setColorDraft] = useState<ColorDraft>(EMPTY_COLOR)
  const [isSaving, setIsSaving] = useState(false)

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(price)

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Buzos", icon: Package },
    { id: "orders", label: "Órdenes", icon: ShoppingCart },
    { id: "home-cms", label: "Gestión del Home", icon: Home },
  ]

  const openNewForm = () => {
    setForm(EMPTY_FORM)
    setColorDraft(EMPTY_COLOR)
    setEditingId(null)
    setShowProductForm(true)
  }

  const openEditForm = (product: typeof products[0]) => {
    setForm({
      name: product.name,
      price: String(product.basePrice),
      category: product.category,
      sizes: product.sizes,
      colors: product.colors,
      image: product.image,
    })
    setColorDraft(EMPTY_COLOR)
    setEditingId(product.id)
    setShowProductForm(true)
  }

  const closeForm = () => {
    setShowProductForm(false)
    setEditingId(null)
  }

  const toggleSize = (size: string) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(size) ? f.sizes.filter((s) => s !== size) : [...f.sizes, size],
    }))
  }

  const addColor = () => {
    if (!colorDraft.name.trim()) return
    setForm((f) => ({ ...f, colors: [...f.colors, { name: colorDraft.name, hex: colorDraft.hex, image: colorDraft.image || undefined }] }))
    setColorDraft(EMPTY_COLOR)
  }

  const removeColor = (idx: number) => {
    setForm((f) => ({ ...f, colors: f.colors.filter((_, i) => i !== idx) }))
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.price || form.sizes.length === 0) {
      toast.error("Nombre, precio y al menos una talla son requeridos")
      return
    }
    setIsSaving(true)
    const data = {
      name: form.name.trim(),
      basePrice: parseInt(form.price),
      category: form.category,
      sizes: form.sizes,
      colors: form.colors,
      image: form.image,
    }
    const result = editingId ? await updateProduct(editingId, data) : await createProduct(data)
    setIsSaving(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(editingId ? "Buzo actualizado" : "Buzo creado")
      closeForm()
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return
    const result = await deleteProduct(id)
    if (result.error) toast.error(result.error)
    else toast.success("Buzo eliminado")
  }

  const getStatusBadge = (status: Order["status"]) => {
    const styles = { pending: "bg-yellow-100 text-yellow-700", production: "bg-blue-100 text-blue-700", shipped: "bg-green-100 text-green-700" }
    const labels = { pending: "Pendiente", production: "En Producción", shipped: "Enviado" }
    return (
      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", styles[status])}>
        {labels[status]}
      </span>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-secondary/20 p-6 hidden md:flex flex-col">
        <Button variant="ghost" onClick={() => setCurrentView("home")} className="mb-8 gap-2 w-full justify-start">
          <ArrowLeft className="h-4 w-4" />
          Volver a la tienda
        </Button>
        <div className="mb-8">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">KOY by m&m</p>
        </div>
        <nav className="space-y-1 flex-1">
          {sidebarItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as AdminTab)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                activeTab === id ? "bg-foreground text-background" : "hover:bg-secondary"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
              {id === "home-cms" && (
                <span className="ml-auto text-xs px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 font-semibold">CMS</span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile tabs */}
      <div className="md:hidden fixed top-16 left-0 right-0 z-40 bg-background border-b p-4">
        <div className="flex gap-2 overflow-x-auto">
          {sidebarItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as AdminTab)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                activeTab === id ? "bg-foreground text-background" : "bg-secondary"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 p-6 md:p-8 mt-16 md:mt-0 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >

            {/* Dashboard */}
            {activeTab === "dashboard" && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold">Dashboard</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Órdenes Totales", value: orders.length, icon: ShoppingCart, color: "blue" },
                    { label: "Pendientes", value: orders.filter((o) => o.status === "pending").length, icon: Clock, color: "yellow" },
                    { label: "Productos", value: products.length, icon: Package, color: "purple" },
                    { label: "Enviados", value: orders.filter((o) => o.status === "shipped").length, icon: Truck, color: "green" },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="p-6 border rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg bg-${color}-100`}>
                          <Icon className={`h-5 w-5 text-${color}-600`} />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{label}</p>
                          <p className="text-2xl font-bold">{value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border rounded-xl overflow-hidden">
                  <div className="p-4 border-b bg-secondary/30">
                    <h3 className="font-semibold">Órdenes Recientes</h3>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.slice(0, 5).map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.customerName}</TableCell>
                          <TableCell>{formatPrice(order.total)}</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Products */}
            {activeTab === "products" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-2xl font-bold">Buzos</h2>
                  {!showProductForm && (
                    <Button onClick={openNewForm} className="gap-2">
                      <Plus className="h-4 w-4" />Nuevo Buzo
                    </Button>
                  )}
                </div>

                {/* Form */}
                {showProductForm && (
                  <div className="p-6 border rounded-xl space-y-6 bg-secondary/10">
                    <h3 className="font-semibold text-lg">{editingId ? "Editar Buzo" : "Nuevo Buzo"}</h3>

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nombre del Buzo *</Label>
                        <Input
                          placeholder="Ej: Naruto Shippuden Oversized"
                          value={form.name}
                          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Precio (COP) *</Label>
                        <Input
                          type="number"
                          placeholder="89000"
                          value={form.price}
                          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Categoría *</Label>
                        <Select
                          value={form.category}
                          onValueChange={(v) => setForm((f) => ({ ...f, category: v as "anime" | "cine" }))}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="anime">Anime</SelectItem>
                            <SelectItem value="cine">Cine</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Sizes */}
                    <div className="space-y-2">
                      <Label>Tallas disponibles *</Label>
                      <div className="flex gap-2 flex-wrap">
                        {SIZES_OPTIONS.map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => toggleSize(size)}
                            className={cn(
                              "px-4 py-2 rounded-lg border-2 font-medium transition-all text-sm",
                              form.sizes.includes(size)
                                ? "border-foreground bg-foreground text-background"
                                : "border-border hover:border-foreground/50"
                            )}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Main image */}
                    <ImageUploader
                      label="Imagen principal del buzo (fallback si no hay imagen por color)"
                      value={form.image}
                      onChange={(url) => setForm((f) => ({ ...f, image: url }))}
                    />

                    {/* Colors */}
                    <div className="space-y-3">
                      <Label>Colores disponibles</Label>
                      <p className="text-xs text-muted-foreground">
                        Agrega cada color con su imagen del buzo en ese color. Al elegir el color, el cliente verá esa imagen.
                      </p>

                      {/* Existing colors */}
                      {form.colors.length > 0 && (
                        <div className="space-y-2">
                          {form.colors.map((c, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-background border rounded-xl">
                              <div className="w-8 h-8 rounded-full border flex-shrink-0" style={{ backgroundColor: c.hex }} />
                              {c.image && (
                                <img src={c.image} alt={c.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                              )}
                              <span className="font-medium text-sm flex-1">{c.name}</span>
                              <button
                                onClick={() => removeColor(idx)}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add new color */}
                      <div className="p-4 border border-dashed rounded-xl space-y-3">
                        <p className="text-sm font-medium text-muted-foreground">Agregar color</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Nombre del color</Label>
                            <Input
                              placeholder="Ej: Negro, Blanco, Gris"
                              value={colorDraft.name}
                              onChange={(e) => setColorDraft((c) => ({ ...c, name: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Color (hex)</Label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={colorDraft.hex}
                                onChange={(e) => setColorDraft((c) => ({ ...c, hex: e.target.value }))}
                                className="w-12 h-10 rounded border cursor-pointer"
                              />
                              <Input
                                value={colorDraft.hex}
                                onChange={(e) => setColorDraft((c) => ({ ...c, hex: e.target.value }))}
                                placeholder="#1a1a1a"
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>
                        <ImageUploader
                          label={`Foto del buzo en color ${colorDraft.name || "..."} (opcional)`}
                          value={colorDraft.image}
                          onChange={(url) => setColorDraft((c) => ({ ...c, image: url }))}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addColor}
                          disabled={!colorDraft.name.trim()}
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Agregar este color
                        </Button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                        {editingId ? "Guardar Cambios" : "Crear Buzo"}
                      </Button>
                      <Button variant="outline" onClick={closeForm}>Cancelar</Button>
                    </div>
                  </div>
                )}

                {/* Product list */}
                {products.length === 0 && !showProductForm ? (
                  <div className="border border-dashed rounded-xl p-12 text-center">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                    <p className="text-muted-foreground mb-4">No hay buzos todavía</p>
                    <Button onClick={openNewForm} className="gap-2">
                      <Plus className="h-4 w-4" />Crear el primer buzo
                    </Button>
                  </div>
                ) : !showProductForm && (
                  <div className="border rounded-xl overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Imagen</TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Categoría</TableHead>
                          <TableHead>Precio</TableHead>
                          <TableHead>Tallas</TableHead>
                          <TableHead>Colores</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                            </TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell className="capitalize">{product.category}</TableCell>
                            <TableCell>{formatPrice(product.basePrice)}</TableCell>
                            <TableCell>{product.sizes.join(", ")}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {product.colors.map((c) => (
                                  <div
                                    key={c.name}
                                    className="w-5 h-5 rounded-full border"
                                    style={{ backgroundColor: c.hex }}
                                    title={c.name}
                                  />
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openEditForm(product)}>
                                    <Edit className="h-4 w-4 mr-2" />Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleDelete(product.id, product.name)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}

            {/* Orders */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Gestión de Órdenes</h2>
                <div className="border rounded-xl overflow-hidden">
                  <div className="p-4 border-b bg-secondary/30 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Buscar órdenes..." className="pl-9" />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID Orden</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Teléfono</TableHead>
                          <TableHead>Dirección</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.id}</TableCell>
                            <TableCell>{order.customerName}</TableCell>
                            <TableCell>{order.phone}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{order.address}, {order.city}</TableCell>
                            <TableCell>{formatPrice(order.total)}</TableCell>
                            <TableCell>
                              <Select value={order.status} onValueChange={(v) => updateOrderStatus(order.id, v as Order["status"])}>
                                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending"><div className="flex items-center gap-2"><Clock className="h-3 w-3 text-yellow-600" />Pendiente</div></SelectItem>
                                  <SelectItem value="production"><div className="flex items-center gap-2"><Package className="h-3 w-3 text-blue-600" />En Producción</div></SelectItem>
                                  <SelectItem value="shipped"><div className="flex items-center gap-2"><Truck className="h-3 w-3 text-green-600" />Enviado</div></SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}

            {/* Home CMS */}
            {activeTab === "home-cms" && <HomeCMSView />}

          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
