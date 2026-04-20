"use client"

import { useEffect } from "react"
import { StoreProvider, useStore } from "@/lib/store-context"
import { Navbar } from "@/components/navbar"
import { HomeView } from "@/components/views/home-view"
import { CatalogView } from "@/components/views/catalog-view"
import { ProductView } from "@/components/views/product-view"
import { LoginView } from "@/components/views/login-view"
import { CheckoutView } from "@/components/views/checkout-view"
import { ProfileView } from "@/components/views/profile-view"
import { OrdersView } from "@/components/views/orders-view"
import { AdminView } from "@/components/views/admin-view"
import { SupportView } from "@/components/views/support-view"
import { LegalView } from "@/components/views/legal-view"

function AppContent() {
  const { currentView, setCurrentView, isAdmin, isAuthLoading } = useStore()

  // Guard: if non-admin tries to access admin, redirect to home
  useEffect(() => {
    if (currentView === "admin" && !isAuthLoading && !isAdmin) {
      setCurrentView("home")
    }
  }, [currentView, isAdmin, isAuthLoading, setCurrentView])

  if (currentView === "admin") {
    if (isAuthLoading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
          Cargando...
        </div>
      )
    }
    if (!isAdmin) return null
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <AdminView />
      </div>
    )
  }

  const renderView = () => {
    if (currentView.startsWith("product-")) {
      return <ProductView productId={currentView.replace("product-", "")} />
    }
    switch (currentView) {
      case "home":       return <HomeView />
      case "catalog":    return <CatalogView />
      case "login":      return <LoginView />
      case "checkout":   return <CheckoutView />
      case "profile":    return <ProfileView />
      case "orders":     return <OrdersView />
      case "support-contacto":     return <SupportView page="contacto" />
      case "support-envios":       return <SupportView page="envios" />
      case "support-devoluciones": return <SupportView page="devoluciones" />
      case "support-faq":          return <SupportView page="faq" />
      case "legal-terminos":       return <LegalView page="terminos" />
      case "legal-privacidad":     return <LegalView page="privacidad" />
      default: return <HomeView />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>{renderView()}</main>
    </div>
  )
}

export default function Page() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  )
}
