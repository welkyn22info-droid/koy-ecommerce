"use client"

import { ShoppingBag, Menu, X, User, LogOut, Package, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import { useStore } from "@/lib/store-context"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function Navbar() {
  const {
    cartCount,
    cart,
    cartTotal,
    removeFromCart,
    updateQuantity,
    isLoggedIn,
    isAdmin,
    user,
    logout,
    setCurrentView,
    setCategoryFilter,
  } = useStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  const handleNavClick = (view: string, category: string | null = null) => {
    setCurrentView(view)
    setCategoryFilter(category)
    setMobileMenuOpen(false)
  }

  const handleCheckout = () => {
    setCartOpen(false)
    if (isLoggedIn) {
      setCurrentView("checkout")
    } else {
      setCurrentView("login")
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <button
          onClick={() => handleNavClick("home")}
          className="flex items-center gap-1.5"
        >
          <span className="text-2xl font-black tracking-tight">KOY</span>
          <span className="text-xs font-medium text-muted-foreground tracking-widest leading-none mt-0.5">by m&m</span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => handleNavClick("home")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Inicio
          </button>
          <button
            onClick={() => handleNavClick("catalog")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Catálogo
          </button>
          <button
            onClick={() => handleNavClick("catalog", "anime")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Colección Anime
          </button>
          <button
            onClick={() => handleNavClick("catalog", "cine")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Colección Cine
          </button>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Cart */}
          <Sheet open={cartOpen} onOpenChange={setCartOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-foreground text-background text-xs flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col">
              <SheetHeader>
                <SheetTitle>Tu Carrito</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto py-4">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">Tu carrito está vacío</p>
                    <Button
                      variant="link"
                      onClick={() => {
                        setCartOpen(false)
                        handleNavClick("catalog")
                      }}
                    >
                      Explorar productos
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 p-3 bg-secondary/30 rounded-lg"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {item.product.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {item.size} / {item.color.name}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="w-6 h-6 rounded border flex items-center justify-center text-sm hover:bg-secondary"
                            >
                              -
                            </button>
                            <span className="text-sm w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="w-6 h-6 rounded border flex items-center justify-center text-sm hover:bg-secondary"
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="ml-auto text-xs text-muted-foreground hover:text-destructive"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">
                            {formatPrice(item.product.basePrice * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {cart.length > 0 && (
                <SheetFooter className="border-t pt-4">
                  <div className="w-full space-y-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Subtotal</span>
                      <span>{formatPrice(cartTotal)}</span>
                    </div>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleCheckout}
                    >
                      Ir a Pagar
                    </Button>
                  </div>
                </SheetFooter>
              )}
            </SheetContent>
          </Sheet>

          {/* Auth */}
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setCurrentView("profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Mis Datos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrentView("orders")}>
                  <Package className="mr-2 h-4 w-4" />
                  Mis Pedidos
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => setCurrentView("admin")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex"
              onClick={() => setCurrentView("login")}
            >
              Iniciar Sesión
            </Button>
          )}

          {/* Mobile Menu */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          "md:hidden border-t bg-background absolute w-full transition-all duration-300 ease-in-out",
          mobileMenuOpen
            ? "max-h-96 opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        )}
      >
        <nav className="flex flex-col p-4 gap-2">
          <button
            onClick={() => handleNavClick("home")}
            className="text-left py-2 text-sm font-medium hover:text-foreground/80"
          >
            Inicio
          </button>
          <button
            onClick={() => handleNavClick("catalog")}
            className="text-left py-2 text-sm font-medium hover:text-foreground/80"
          >
            Catálogo
          </button>
          <button
            onClick={() => handleNavClick("catalog", "anime")}
            className="text-left py-2 text-sm font-medium hover:text-foreground/80"
          >
            Colección Anime
          </button>
          <button
            onClick={() => handleNavClick("catalog", "cine")}
            className="text-left py-2 text-sm font-medium hover:text-foreground/80"
          >
            Colección Cine
          </button>
          {!isLoggedIn && (
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => handleNavClick("login")}
            >
              Iniciar Sesión
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
