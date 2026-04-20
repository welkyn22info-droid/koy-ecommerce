"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, XCircle, Clock, ArrowLeft, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface OrderData {
  id: string
  order_number: string
  status: string
  total: number
  customer_name: string
  created_at: string
  paid_at: string | null
}

const STATUS_LABELS: Record<string, { label: string; icon: JSX.Element; color: string }> = {
  paid: {
    label: "¡Pago aprobado!",
    icon: <CheckCircle2 className="h-12 w-12 text-green-600" />,
    color: "text-green-600",
  },
  pending_payment: {
    label: "Pago pendiente",
    icon: <Clock className="h-12 w-12 text-yellow-500" />,
    color: "text-yellow-600",
  },
  payment_failed: {
    label: "Pago rechazado",
    icon: <XCircle className="h-12 w-12 text-red-500" />,
    color: "text-red-600",
  },
}

export default function ConfirmacionContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get("order")
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!orderNumber) { setError("Número de orden no encontrado"); setLoading(false); return }

    const fetchOrder = async () => {
      try {
        // Poll a couple times to give webhook time to process
        let attempts = 0
        let data: OrderData | null = null

        while (attempts < 4) {
          const res = await fetch(`/api/bold/verify?order=${orderNumber}`)
          if (res.ok) {
            const json = await res.json()
            data = json.order
            if (data && data.status !== "pending_payment") break
          }
          attempts++
          if (attempts < 4) await new Promise((r) => setTimeout(r, 2000))
        }

        if (data) setOrder(data)
        else setError("No se encontró el pedido")
      } catch {
        setError("Error al verificar el pedido")
      }
      setLoading(false)
    }

    fetchOrder()
  }, [orderNumber])

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(price)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full border-4 border-foreground/20 border-t-foreground animate-spin mx-auto" />
          <p className="text-muted-foreground">Verificando tu pago...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <XCircle className="h-16 w-16 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold">Pedido no encontrado</h1>
          <p className="text-muted-foreground">{error || "No pudimos encontrar tu pedido."}</p>
          <Link href="/"><Button>Ir al inicio</Button></Link>
        </div>
      </div>
    )
  }

  const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS["pending_payment"]

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Icon */}
        <div className="flex justify-center">{statusInfo.icon}</div>

        {/* Title */}
        <div>
          <h1 className={`text-3xl font-bold tracking-tight ${statusInfo.color}`}>
            {statusInfo.label}
          </h1>
          {order.status === "paid" && (
            <p className="text-muted-foreground mt-2">
              Tu pedido está en proceso. Te enviamos la confirmación a tu correo.
            </p>
          )}
          {order.status === "payment_failed" && (
            <p className="text-muted-foreground mt-2">
              El pago no fue procesado. Puedes intentarlo nuevamente.
            </p>
          )}
          {order.status === "pending_payment" && (
            <p className="text-muted-foreground mt-2">
              Tu pago está siendo procesado. Esto puede tomar unos minutos.
            </p>
          )}
        </div>

        {/* Order card */}
        <div className="p-6 bg-secondary/30 rounded-2xl text-left space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Número de pedido</p>
            <p className="text-2xl font-bold">{order.order_number}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Cliente</p>
            <p className="font-medium">{order.customer_name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-xl font-semibold">{formatPrice(order.total)}</p>
          </div>
        </div>

        {/* Contact */}
        <p className="text-sm text-muted-foreground">
          ¿Tienes preguntas? Escríbenos a{" "}
          <a href="mailto:welkyn22.info@gmail.com" className="text-foreground underline">
            welkyn22.info@gmail.com
          </a>
        </p>

        {/* CTA */}
        <div className="flex flex-col gap-3">
          {order.status === "payment_failed" && (
            <Link href="/"><Button size="lg" className="w-full gap-2"><ShoppingBag className="h-4 w-4" />Volver al carrito</Button></Link>
          )}
          <Link href="/"><Button size="lg" variant={order.status === "payment_failed" ? "outline" : "default"} className="w-full gap-2">
            <ArrowLeft className="h-4 w-4" />Volver a la tienda
          </Button></Link>
        </div>
      </div>
    </div>
  )
}
