"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { supabase, type DbProduct, type DbHomeConfig } from "./supabase"

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
}

export interface Order {
  id: string
  userId: string
  customerName: string
  phone: string
  address: string
  city: string
  notes: string
  items: CartItem[]
  total: number
  status: "pending" | "production" | "shipped"
  createdAt: Date
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

// Mock fallback orders
const MOCK_ORDERS: Order[] = [
  { id: "ORD-001", userId: "1", customerName: "Carlos Mendez", phone: "+57 310 555 1234", address: "Calle 100 #45-67, Apto 502", city: "Bogotá, Cundinamarca", notes: "Entregar en portería", items: [], total: 178000, status: "pending", createdAt: new Date("2024-01-15") },
  { id: "ORD-002", userId: "2", customerName: "María García", phone: "+57 315 555 5678", address: "Carrera 70 #12-34", city: "Medellín, Antioquia", notes: "", items: [], total: 95000, status: "production", createdAt: new Date("2024-01-14") },
  { id: "ORD-003", userId: "3", customerName: "Andrés López", phone: "+57 320 555 9012", address: "Av. 6N #25N-67", city: "Cali, Valle del Cauca", notes: "Llamar antes de entregar", items: [], total: 276000, status: "shipped", createdAt: new Date("2024-01-10") },
]

interface StoreContextType {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  cartTotal: number
  cartCount: number
  user: User | null
  login: (email: string, password: string) => void
  loginWithGoogle: () => void
  logout: () => void
  isLoggedIn: boolean
  isAdmin: boolean
  currentView: string
  setCurrentView: (view: string) => void
  products: Product[]
  categoryFilter: string | null
  setCategoryFilter: (category: string | null) => void
  orders: Order[]
  updateOrderStatus: (orderId: string, status: Order["status"]) => void
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
  const [currentView, setCurrentView] = useState("home")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS)
  const [products, setProducts] = useState<Product[]>([])
  const [homeConfig, setHomeConfig] = useState<HomeConfig>(DEFAULT_HOME_CONFIG)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)

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
      } catch {
        // fallback: products stay empty, home config stays default
      } finally {
        setIsLoadingProducts(false)
      }
    }
    loadData()
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

  const login = (email: string, _password: string) => {
    const isAdmin = email === "welkyn22.info@gmail.com"
    setUser({
      id: isAdmin ? "admin" : "1",
      name: isAdmin ? "Administrador" : email.split("@")[0],
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    })
  }

  const loginWithGoogle = () => {
    setUser({ id: "2", name: "Usuario Google", email: "usuario@gmail.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=google" })
  }

  const logout = () => setUser(null)
  const isAdmin = user?.email === "welkyn22.info@gmail.com"

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)))
  }

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
      user, login, loginWithGoogle, logout, isLoggedIn: !!user, isAdmin,
      currentView, setCurrentView,
      products, categoryFilter, setCategoryFilter,
      orders, updateOrderStatus,
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
