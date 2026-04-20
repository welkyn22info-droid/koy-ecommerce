"use client"

import { useState } from "react"
import { ArrowLeft, Check, CreditCard, Truck, MapPin, Phone, User, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useStore } from "@/lib/store-context"

export function CheckoutView() {
  const { cart, cartTotal, clearCart, setCurrentView, user } = useStore()
  const [orderConfirmed, setOrderConfirmed] = useState(false)
  const [orderId, setOrderId] = useState("")

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newOrderId = `ORD-${Date.now().toString().slice(-6)}`
    setOrderId(newOrderId)
    setOrderConfirmed(true)
    clearCart()
  }

  if (orderConfirmed) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              ¡Pedido Confirmado!
            </h1>
            <p className="text-muted-foreground mt-2">
              Tu orden ha sido registrada exitosamente
            </p>
          </div>
          <div className="p-4 bg-secondary/30 rounded-xl">
            <p className="text-sm text-muted-foreground">Número de orden</p>
            <p className="text-2xl font-bold">{orderId}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Te enviaremos un mensaje de confirmación con los detalles de tu pedido y el seguimiento del envío.
          </p>
          <div className="flex flex-col gap-3 pt-4">
            <Button onClick={() => setCurrentView("orders")} variant="outline">
              Ver mis pedidos
            </Button>
            <Button onClick={() => setCurrentView("home")}>
              Seguir comprando
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Tu carrito está vacío
          </p>
          <Button onClick={() => setCurrentView("catalog")}>
            Ver productos
          </Button>
        </div>
      </div>
    )
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
        Seguir comprando
      </Button>

      <h1 className="text-3xl font-bold tracking-tight mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Shipping Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="p-6 border rounded-xl space-y-6">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Datos de Envío</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Nombre Completo
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="Tu nombre completo"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Teléfono
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+57 300 123 4567"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="h-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Dirección Exacta
                </Label>
                <Input
                  id="address"
                  placeholder="Calle, número, apartamento, barrio"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ciudad / Departamento</Label>
                <Input
                  id="city"
                  placeholder="Bogotá, Cundinamarca"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Indicaciones Adicionales (opcional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Ej: Entregar en portería, llamar antes de llegar..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <div className="p-6 border rounded-xl space-y-6">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Método de Pago</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border-2 border-foreground rounded-xl bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border-4 border-foreground" />
                    <span className="font-medium">Pago contra entrega</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 ml-7">
                    Paga en efectivo cuando recibas tu pedido
                  </p>
                </div>
                <div className="p-4 border rounded-xl opacity-50">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                    <span className="font-medium">Transferencia / Nequi</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 ml-7">
                    Próximamente
                  </p>
                </div>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full h-14 text-lg gap-2">
              Confirmar y Pagar
              <CreditCard className="h-5 w-5" />
            </Button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="p-6 border rounded-xl space-y-6">
              <h2 className="text-xl font-semibold">Resumen del Pedido</h2>

              <div className="space-y-4 max-h-80 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.size} / {item.color.name} / {item.design.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Cant: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-sm">
                      {formatPrice(item.product.basePrice * item.quantity)}
                    </p>
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
