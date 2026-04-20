import { NextResponse } from "next/server"
import { createHmac } from "crypto"
import { z } from "zod"
import { createSupabaseServiceClient } from "@/lib/supabase-server"

const CartItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  productImage: z.string(),
  size: z.string(),
  colorName: z.string(),
  colorHex: z.string(),
  designId: z.string(),
  designName: z.string(),
  quantity: z.number().int().positive(),
})

const BodySchema = z.object({
  userId: z.string().uuid(),
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(7),
  shippingAddress: z.string().min(5),
  shippingCity: z.string().min(2),
  notes: z.string().optional(),
  items: z.array(CartItemSchema).min(1),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = BodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 })
    }

    const { userId, customerName, customerEmail, customerPhone, shippingAddress, shippingCity, notes, items } = parsed.data
    const supabase = createSupabaseServiceClient()

    // Fetch current prices from DB — never trust client prices
    const productIds = [...new Set(items.map((i) => i.productId))]
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, base_price, name")
      .in("id", productIds)

    if (productsError || !products) {
      return NextResponse.json({ error: "Error al verificar precios" }, { status: 500 })
    }

    const priceMap = new Map(products.map((p) => [p.id, p.base_price]))

    // Validate all products exist and calculate totals server-side
    for (const item of items) {
      if (!priceMap.has(item.productId)) {
        return NextResponse.json({ error: `Producto no encontrado: ${item.productId}` }, { status: 400 })
      }
    }

    const subtotal = items.reduce((sum, item) => {
      return sum + (priceMap.get(item.productId)! * item.quantity)
    }, 0)
    const shipping = 0
    const total = subtotal + shipping

    // Create order in DB
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        status: "pending_payment",
        subtotal,
        shipping,
        total,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        shipping_address: shippingAddress,
        shipping_city: shippingCity,
        notes: notes || "",
        customer_snapshot: { name: customerName, email: customerEmail, phone: customerPhone },
      })
      .select("id, order_number")
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "Error al crear orden" }, { status: 500 })
    }

    // Insert order items with product snapshots
    const orderItemsToInsert = items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: priceMap.get(item.productId)!,
      line_total: priceMap.get(item.productId)! * item.quantity,
      product_snapshot: {
        name: item.productName,
        image: item.productImage,
        size: item.size,
        color: { name: item.colorName, hex: item.colorHex },
        design: { id: item.designId, name: item.designName },
      },
    }))

    await supabase.from("order_items").insert(orderItemsToInsert)

    // Create payment record
    await supabase.from("payments").insert({
      order_id: order.id,
      status: "pending",
      amount: total,
      currency: "COP",
    })

    // Record status history
    await supabase.from("order_status_history").insert({
      order_id: order.id,
      from_status: null,
      to_status: "pending_payment",
      changed_by: "system",
      reason: "Orden creada, pendiente de pago Bold",
    })

    // Generate Bold integrity signature
    // Format: SHA256(orderId + amount + currency + secretKey)
    const boldSecretKey = process.env.BOLD_SECRET_KEY!
    const boldIdentityKey = process.env.BOLD_IDENTITY_KEY!
    const amountStr = total.toFixed(2)
    const currency = "COP"
    const orderRef = order.order_number

    const integritySignature = createHmac("sha256", boldSecretKey)
      .update(`${orderRef}${amountStr}${currency}`)
      .digest("hex")

    const redirectionUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/confirmacion?order=${order.order_number}`

    const boldUrl =
      `https://checkout.bold.co/payment/link/${boldIdentityKey}` +
      `?amount=${amountStr}` +
      `&currency=${currency}` +
      `&description=${encodeURIComponent(`Pedido ${orderRef} - KOY by m&m`)}` +
      `&orderReference=${orderRef}` +
      `&integritySignature=${integritySignature}` +
      `&redirectionUrl=${encodeURIComponent(redirectionUrl)}`

    return NextResponse.json({
      boldUrl,
      orderNumber: order.order_number,
      orderId: order.id,
    })
  } catch (err) {
    console.error("[bold/link] error:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
