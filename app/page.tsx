"use client"

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
  const { currentView } = useStore()

  if (currentView === "admin") {
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
      // Support pages
      case "support-contacto":    return <SupportView page="contacto" />
      case "support-envios":      return <SupportView page="envios" />
      case "support-devoluciones": return <SupportView page="devoluciones" />
      case "support-faq":         return <SupportView page="faq" />
      // Legal pages
      case "legal-terminos":   return <LegalView page="terminos" />
      case "legal-privacidad": return <LegalView page="privacidad" />
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
