import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type DbProduct = {
  id: string
  name: string
  base_price: number
  category: "anime" | "cine"
  sizes: string[]
  colors: { name: string; hex: string; image?: string }[]
  designs: unknown[]
  image: string
  featured: boolean
  featured_order: number | null
  created_at: string
}

export type DbHomeConfig = {
  id: number
  hero_title: string
  hero_subtitle: string
  hero_cta_text: string
  hero_cta_link: string
  hero_bg_image: string
  theme: string
  featured_product_ids: string[]
  updated_at: string
}

export async function uploadImageToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary no está configurado. Agrega NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME y NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET en .env.local")
  }

  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", uploadPreset)
  formData.append("folder", "koy-ecommerce")

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  })

  if (!res.ok) throw new Error("Error al subir imagen a Cloudinary")
  const data = await res.json()
  // Auto-optimize: webp, quality auto, width 800
  return data.secure_url.replace("/upload/", "/upload/f_auto,q_auto,w_800/")
}
