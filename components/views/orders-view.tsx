"use client"

import { Package, ArrowLeft, Truck, Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store-context"
import { cn } from "@/lib/utils"

export function OrdersView() {
  const { setCurrentView } = useStore()

  const userOrders = [
    {
      id: "ORD-582341",
      date: "15 Ene 2024",
      status: "shipped",
      total: 178000,
      items: [
        { name: "Spirit Away Oversized", size: "M", color: "Negro", quantity: 1 },
        { name: "Attack on Titan", size: "L", color: "Verde Militar", quantity: 1 },
      ],
    },
    {
      id: "ORD-582298",
      date: "10 Ene 2024",
      status: "production",
      total: 95000,
      items: [
        { name: "Pulp Fiction Vibes", size: "L", color: "Negro", quantity: 1 },
      ],
    },
    {
      id: "ORD-582156",
      date: "5 Ene 2024",
      status: "delivered",
      total: 276000,
      items: [
        { name: "Naruto Shippuden", size: "M", color: "Naranja", quantity: 2 },
        { name: "Demon Slayer", size: "L", color: "Negro", quantity: 1 },
      ],
    },
  ]

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "Pendiente",
          icon: Clock,
          color: "text-yellow-600 bg-yellow-50",
        }
      case "production":
        return {
          label: "En Producción",
          icon: Package,
          color: "text-blue-600 bg-blue-50",
        }
      case "shipped":
        return {
          label: "Enviado",
          icon: Truck,
          color: "text-purple-600 bg-purple-50",
        }
      case "delivered":
        return {
          label: "Entregado",
          icon: CheckCircle,
          color: "text-green-600 bg-green-50",
        }
      default:
        return {
          label: status,
          icon: Clock,
          color: "text-muted-foreground bg-secondary",
        }
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="container px-4 md:px-6 py-8 max-w-3xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => setCurrentView("home")}
        className="mb-8 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Button>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Mis Pedidos</h1>
          <p className="text-muted-foreground">
            Historial y seguimiento de tus compras
          </p>
        </div>

        {userOrders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">
              Aún no tienes pedidos
            </p>
            <Button onClick={() => setCurrentView("catalog")}>
              Explorar productos
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {userOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status)
              const StatusIcon = statusInfo.icon

              return (
                <div
                  key={order.id}
                  className="p-6 border rounded-xl space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="font-semibold">{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.date}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                        statusInfo.color
                      )}
                    >
                      <StatusIcon className="h-4 w-4" />
                      {statusInfo.label}
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {item.quantity}x {item.name} ({item.size}, {item.color})
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="font-medium">Total</span>
                    <span className="font-semibold">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
