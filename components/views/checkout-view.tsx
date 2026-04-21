"use client"

import { useState } from "react"
import { ArrowLeft, CreditCard, Truck, MapPin, Phone, User, FileText, ShieldCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useStore } from "@/lib/store-context"
import { toast } from "sonner"

export function CheckoutView() {
  const { cart, cartTotal, clearCart, setCurrentView, user } = useStore()
  const [isProcessing, setIsProcessing] = useState(false)

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  })

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(price)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error("Debes iniciar sesión para continuar")
      setCurrentView("login")
      return
    }

    setIsProcessing(true)

    try {
      const res = await fetch("/api/bold/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          customerName: formData.fullName,
          customerEmail: user.email,
          customerPhone: formData.phone,
          shippingAddress: formData.address,
          shippingCity: formData.city,
          notes: formData.notes,
          items: cart.map((item) => ({
            productId: item.product.id,
            productName: item.product.name,
            productImage: item.product.image,
            size: item.size,
            colorName: item.color.name,
            colorHex: item.color.hex,
            quantity: item.quantity,
          })),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Error al procesar el pedido")
        setIsProcessing(false)
        return
      }

      clearCart()
      // Redirect to Bold checkout
      window.location.href = data.boldUrl
    } catch {
      toast.error("Error de conexión. Intenta nuevamente.")
      setIsProcessing(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Tu carrito está vacío</p>
          <Button onClick={() => setCurrentView("catalog")}>Ver productos</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 md:px-6 py-8">
      <Button variant="ghost" onClick={() => setCurrentView("catalog")} className="mb-8 gap-2">
        <ArrowLeft className="h-4 w-4" />
        Seguir comprando
      </Button>

      <h1 className="text-3xl font-bold tracking-tight mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Shipping data */}
            <div className="p-6 border rounded-xl space-y-6">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Datos de Envío</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />Nombre Completo
                  </Label>
                  <Input id="fullName" placeholder="Tu nombre completo" value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="h-12" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />Teléfono
                  </Label>
                  <Input id="phone" type="tel" placeholder="+57 300 123 4567" value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="h-12" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />Dirección Exacta
                </Label>
                <Input id="address" placeholder="Calle, número, apartamento, barrio" value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="h-12" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ciudad / Departamento</Label>
                <Input id="city" placeholder="Bogotá, Cundinamarca" value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="h-12" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />Indicaciones Adicionales (opcional)
                </Label>
                <Textarea id="notes" placeholder="Ej: Entregar en portería, llamar antes de llegar..."
                  value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="min-h-[100px]" />
              </div>
            </div>

            {/* Payment */}
            <div className="p-6 border rounded-xl space-y-6">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Método de Pago</h2>
              </div>

              <div className="p-4 border-2 border-foreground rounded-xl bg-secondary/30">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-4 h-4 rounded-full border-4 border-foreground shrink-0" />
                  <span className="font-medium">Pago en línea — Bold</span>
                </div>
                <p className="text-sm text-muted-foreground ml-7">
                  Tarjeta débito/crédito, PSE, Nequi y Daviplata. Pago 100% seguro.
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-green-600 shrink-0" />
                <span>Tu pago es procesado de forma segura por Bold. KOY nunca almacena datos de tu tarjeta.</span>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full h-14 text-lg gap-2" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Preparando pago...
                </>
              ) : (
                <>
                  Continuar al pago seguro
                  <CreditCard className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="p-6 border rounded-xl space-y-6">
              <h2 className="text-xl font-semibold">Resumen del Pedido</h2>

              <div className="space-y-4 max-h-80 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img src={item.product.image} alt={item.product.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">{item.size} / {item.color.name}</p>
                      <p className="text-xs text-muted-foreground">Cant: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-sm">{formatPrice(item.product.basePrice * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envío</span>
                  <span>Por calcular</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-3 border-t">
                  <span>Total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
