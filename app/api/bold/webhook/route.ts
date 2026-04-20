import { NextResponse } from "next/server"
import { createHmac } from "crypto"
import { createSupabaseServiceClient } from "@/lib/supabase-server"
import { Resend } from "resend"

export async function POST(request: Request) {
  const supabase = createSupabaseServiceClient()

  let payload: Record<string, unknown>
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  // Bold sends signature in header x-bold-signature
  const receivedSignature = request.headers.get("x-bold-signature") || ""
  const boldSecretKey = process.env.BOLD_SECRET_KEY!

  // Verify HMAC signature
  const expectedSignature = createHmac("sha256", boldSecretKey)
    .update(JSON.stringify(payload))
    .digest("hex")

  if (receivedSignature !== expectedSignature) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 })
  }

  // Idempotency: use transaction ID as unique event ID
  const eventId = (payload.transaction_id || payload.id || payload.order_reference) as string
  if (!eventId) {
    return NextResponse.json({ error: "Evento sin ID" }, { status: 400 })
  }

  // Check if already processed
  const { data: existing } = await supabase
    .from("payment_webhooks")
    .select("id, processed")
    .eq("bold_event_id", eventId)
    .single()

  if (existing?.processed) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  // Log webhook (upsert for retry safety)
  await supabase.from("payment_webhooks").upsert({
    bold_event_id: eventId,
    event_type: payload.status as string,
    payload,
    processed: false,
    received_at: new Date().toISOString(),
  }, { onConflict: "bold_event_id" })

  // Find order by order_number (orderReference)
  const orderReference = payload.order_reference as string
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, order_number, status, customer_email, customer_name, total")
    .eq("order_number", orderReference)
    .single()

  if (orderError || !order) {
    await supabase.from("payment_webhooks")
      .update({ error: `Order not found: ${orderReference}` })
      .eq("bold_event_id", eventId)
    return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 })
  }

  const boldStatus = (payload.status as string)?.toLowerCase()
  let newOrderStatus: string
  let paymentStatus: string

  if (boldStatus === "approved") {
    newOrderStatus = "paid"
    paymentStatus = "approved"
  } else if (boldStatus === "rejected" || boldStatus === "failed") {
    newOrderStatus = "payment_failed"
    paymentStatus = "rejected"
  } else if (boldStatus === "voided") {
    newOrderStatus = "cancelled"
    paymentStatus = "voided"
  } else {
    // Unknown status — log and exit without error
    await supabase.from("payment_webhooks")
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq("bold_event_id", eventId)
    return NextResponse.json({ ok: true })
  }

  // Update payment record
  await supabase.from("payments").upsert({
    order_id: order.id,
    bold_payment_id: payload.id as string,
    bold_transaction_id: payload.transaction_id as string,
    status: paymentStatus,
    amount: order.total,
    currency: "COP",
    payment_method: payload.payment_method as string,
    raw_response: payload,
    confirmed_at: paymentStatus === "approved" ? new Date().toISOString() : null,
  }, { onConflict: "bold_payment_id" })

  // Update order status
  const previousStatus = order.status
  await supabase.from("orders").update({
    status: newOrderStatus,
    paid_at: newOrderStatus === "paid" ? new Date().toISOString() : null,
  }).eq("id", order.id)

  // Record status history
  await supabase.from("order_status_history").insert({
    order_id: order.id,
    from_status: previousStatus,
    to_status: newOrderStatus,
    changed_by: "bold_webhook",
    reason: `Bold payment ${paymentStatus} — event ${eventId}`,
  })

  // Send confirmation email if approved
  if (paymentStatus === "approved" && process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: "KOY by m&m <noreply@welkyn.com>",
        to: order.customer_email,
        subject: `¡Tu pedido ${order.order_number} fue confirmado! 🎉`,
        html: buildConfirmationEmail(order.order_number, order.customer_name, order.total),
      })

      // Copy to admin
      await resend.emails.send({
        from: "KOY by m&m <noreply@welkyn.com>",
        to: "welkyn22.info@gmail.com",
        subject: `Nuevo pedido ${order.order_number} — $${order.total.toLocaleString("es-CO")} COP`,
        html: buildAdminNotificationEmail(order.order_number, order.customer_name, order.customer_email, order.total),
      })
    } catch (emailErr) {
      console.error("[bold/webhook] email error:", emailErr)
    }
  }

  // Mark webhook as processed
  await supabase.from("payment_webhooks").update({
    processed: true,
    processed_at: new Date().toISOString(),
  }).eq("bold_event_id", eventId)

  return NextResponse.json({ ok: true })
}

function buildConfirmationEmail(orderNumber: string, customerName: string, total: number): string {
  const formatted = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(total)
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h1 style="font-size: 28px; font-weight: 900; margin-bottom: 4px;">KOY <span style="font-size: 14px; font-weight: 400; color: #666;">by m&m</span></h1>
      <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
      <h2 style="color: #111;">¡Pedido confirmado, ${customerName}! 🎉</h2>
      <p style="color: #555;">Tu pago fue aprobado y tu pedido ya está en proceso.</p>
      <div style="background: #f9f9f9; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <p style="margin: 0; font-size: 14px; color: #888;">Número de pedido</p>
        <p style="margin: 4px 0 0; font-size: 24px; font-weight: 700;">${orderNumber}</p>
        <p style="margin: 12px 0 0; font-size: 14px; color: #888;">Total pagado</p>
        <p style="margin: 4px 0 0; font-size: 20px; font-weight: 600;">${formatted}</p>
      </div>
      <p style="color: #555;">Te notificaremos cuando tu pedido sea enviado. Si tienes preguntas, escríbenos a <a href="mailto:welkyn22.info@gmail.com" style="color: #111;">welkyn22.info@gmail.com</a>.</p>
      <p style="color: #999; font-size: 12px; margin-top: 32px;">© 2025 KOY by m&m. Colombia.</p>
    </div>
  `
}

function buildAdminNotificationEmail(orderNumber: string, customerName: string, customerEmail: string, total: number): string {
  const formatted = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(total)
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <h2>Nuevo pedido recibido</h2>
      <p><strong>Pedido:</strong> ${orderNumber}</p>
      <p><strong>Cliente:</strong> ${customerName} (${customerEmail})</p>
      <p><strong>Total:</strong> ${formatted}</p>
      <p>Revisa el panel de administración para ver los detalles completos.</p>
    </div>
  `
}
