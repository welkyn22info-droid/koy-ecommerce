import { NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const orderNumber = searchParams.get("order")

  if (!orderNumber) {
    return NextResponse.json({ error: "order param required" }, { status: 400 })
  }

  const supabase = createSupabaseServiceClient()
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, order_number, status, total, customer_name, created_at, paid_at")
    .eq("order_number", orderNumber)
    .single()

  if (error || !order) {
    return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 })
  }

  return NextResponse.json({ order })
}
