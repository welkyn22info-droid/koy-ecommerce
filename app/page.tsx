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

function AppContent() {
  const { currentView } = useStore()

  const renderView = () => {
    if (currentView.startsWith("product-")) {
      const productId = currentView.replace("product-", "")
      return <ProductView productId={productId} />
    }

    switch (currentView) {
      case "home":
        return <HomeView />
      case "catalog":
        return <CatalogView />
      case "login":
        return <LoginView />
      case "checkout":
        return <CheckoutView />
      case "profile":
        return <ProfileView />
      case "orders":
        return <OrdersView />
      case "admin":
        return <AdminView />
      default:
        return <HomeView />
    }
  }

  if (currentView === "admin") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <AdminView />
      </div>
    )
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
