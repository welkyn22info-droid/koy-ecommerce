"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { supabase, type DbProduct, type DbHomeConfig } from "./supabase"
import type { User as SupabaseUser } from "@supabase/supabase-js"

// Types
export interface Product {
  id: string
  name: string
  basePrice: number
  category: "anime" | "cine"
  sizes: string[]
  colors: { name: string; hex: string }[]
  designs: { id: string; name: string; image: string }[]
  image: string
  featured?: boolean
  featuredOrder?: number | null
}

export interface HomeConfig {
  heroTitle: string
  heroSubtitle: string
  heroCTAText: string
  heroCTALink: string
  heroBgImage: string
  theme: "default" | "christmas" | "halloween" | "premiere"
  featuredProductIds: string[]
}

export interface CartItem {
  id: string
  product: Product
  size: string
  color: { name: string; hex: string }
  design: { id: string; name: string; image: string }
  quantity: number
}

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: "customer" | "admin"
}

export interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  createdAt: string
}

const DEFAULT_HOME_CONFIG: HomeConfig = {
  heroTitle: "Viste tu pasión por el anime y el cine",
  heroSubtitle: "Buzos oversized con estampados únicos bajo demanda. Diseños exclusivos que cuentan historias.",
  heroCTAText: "Explorar Colección",
  heroCTALink: "catalog",
  heroBgImage: "",
  theme: "default",
  featuredProductIds: ["1", "2", "3", "4", "5"],
}

function dbProductToProduct(p: DbProduct): Product {
  return {
    id: p.id,
    name: p.name,
    basePrice: p.base_price,
    category: p.category,
    sizes: p.sizes,
    colors: p.colors,
    designs: p.designs,
    image: p.image,
    featured: p.featured,
    featuredOrder: p.featured_order,
  }
}

function dbHomeConfigToHomeConfig(c: DbHomeConfig): HomeConfig {
  return {
    heroTitle: c.hero_title,
    heroSubtitle: c.hero_subtitle,
    heroCTAText: c.hero_cta_text,
    heroCTALink: c.hero_cta_link,
    heroBgImage: c.hero_bg_image,
    theme: c.theme as HomeConfig["theme"],
    featuredProductIds: c.featured_product_ids ?? [],
  }
}

function buildUserFromSupabase(sbUser: SupabaseUser, profile: { name?: string | null; role?: string } | null): User {
  return {
    id: sbUser.id,
    name: profile?.name || sbUser.user_metadata?.name || sbUser.email?.split("@")[0] || "Usuario",
    email: sbUser.email || "",
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${sbUser.email}`,
    role: (profile?.role as "customer" | "admin") || "customer",
  }
}

interface StoreContextType {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  cartTotal: number
  cartCount: number
  user: User | null
  login: (email: string, password: string) => Promise<{ error?: string }>
  loginWithGoogle: () => Promise<void>
  register: (name: string, email: string, password: string) => Promise<{ error?: string }>
  forgotPassword: (email: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  isLoggedIn: boolean
  isAdmin: boolean
  isAuthLoading: boolean
  currentView: string
  setCurrentView: (view: string) => void
  products: Product[]
  categoryFilter: string | null
  setCategoryFilter: (category: string | null) => void
  orders: Order[]
  homeConfig: HomeConfig
  updateHomeConfig: (config: Partial<HomeConfig>) => void
  publishHomeConfig: () => Promise<void>
  isPublishing: boolean
  isLoadingProducts: boolean
  featuredProducts: Product[]
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [currentView, setCurrentView] = useState("home")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [homeConfig, setHomeConfig] = useState<HomeConfig>(DEFAULT_HOME_CONFIG)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)

  // Load products and home_config from Supabase
  useEffect(() => {
    async function loadData() {
      setIsLoadingProducts(true)
      try {
        const [{ data: productsData }, { data: configData }] = await Promise.all([
          supabase.from("products").select("*").order("featured_order", { ascending: true, nullsFirst: false }),
          supabase.from("home_config").select("*").eq("id", 1).single(),
        ])
        if (productsData) setProducts(productsData.map(dbProductToProduct))
        if (configData) setHomeConfig(dbHomeConfigToHomeConfig(configData))
      } catch {}
      finally { setIsLoadingProducts(false) }
    }
    loadData()
  }, [])

  // Supabase Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profileRows } = await supabase.rpc("get_my_profile")
        const profile = profileRows?.[0] ?? null
        setUser(buildUserFromSupabase(session.user, profile))
      }
      setIsAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profileRows } = await supabase.rpc("get_my_profile")
        const profile = profileRows?.[0] ?? null
        setUser(buildUserFromSupabase(session.user, profile))
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const featuredProducts = products
    .filter((p) => homeConfig.featuredProductIds.includes(p.id))
    .sort((a, b) => {
      const ia = homeConfig.featuredProductIds.indexOf(a.id)
      const ib = homeConfig.featuredProductIds.indexOf(b.id)
      return ia - ib
    })

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const idx = prev.findIndex(
        (i) => i.product.id === item.product.id && i.size === item.size && i.color.name === item.color.name && i.design.id === item.design.id
      )
      if (idx > -1) {
        const updated = [...prev]
        updated[idx].quantity += item.quantity
        return updated
      }
      return [...prev, item]
    })
  }

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((i) => i.id !== id))
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)))
  }
  const clearCart = () => setCart([])
  const cartTotal = cart.reduce((sum, i) => sum + i.product.basePrice * i.quantity, 0)
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0)

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return {}
  }

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    })
  }

  const register = async (name: string, email: string, password: string): Promise<{ error?: string }> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) return { error: error.message }
    return {}
  }

  const forgotPassword = async (email: string): Promise<{ error?: string }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/?view=reset-password`,
    })
    if (error) return { error: error.message }
    return {}
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setCurrentView("home")
  }

  const isAdmin = user?.role === "admin"

  const updateHomeConfig = useCallback((config: Partial<HomeConfig>) => {
    setHomeConfig((prev) => ({ ...prev, ...config }))
  }, [])

  const publishHomeConfig = useCallback(async () => {
    setIsPublishing(true)
    try {
      await supabase.from("home_config").update({
        hero_title: homeConfig.heroTitle,
        hero_subtitle: homeConfig.heroSubtitle,
        hero_cta_text: homeConfig.heroCTAText,
        hero_cta_link: homeConfig.heroCTALink,
        hero_bg_image: homeConfig.heroBgImage,
        theme: homeConfig.theme,
        featured_product_ids: homeConfig.featuredProductIds,
        updated_at: new Date().toISOString(),
      }).eq("id", 1)
    } finally {
      setIsPublishing(false)
    }
  }, [homeConfig])

  return (
    <StoreContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount,
      user, login, loginWithGoogle, register, forgotPassword, logout,
      isLoggedIn: !!user, isAdmin, isAuthLoading,
      currentView, setCurrentView,
      products, categoryFilter, setCategoryFilter,
      orders,
      homeConfig, updateHomeConfig, publishHomeConfig, isPublishing,
      isLoadingProducts, featuredProducts,
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) throw new Error("useStore must be used within a StoreProvider")
  return context
}
