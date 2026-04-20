"use client"

import { useState } from "react"
import { Mail, Lock, ArrowRight, Eye, EyeOff, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStore } from "@/lib/store-context"
import { toast } from "sonner"

type Mode = "login" | "register" | "forgot"

export function LoginView() {
  const { login, loginWithGoogle, register, forgotPassword, setCurrentView, cartCount } = useStore()
  const [mode, setMode] = useState<Mode>("login")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  const afterLogin = () => {
    setCurrentView(cartCount > 0 ? "checkout" : "home")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (mode === "login") {
      const { error } = await login(email, password)
      if (error) {
        toast.error("Credenciales incorrectas. Verifica tu email y contraseña.")
      } else {
        toast.success("¡Bienvenido!")
        afterLogin()
      }
    } else if (mode === "register") {
      if (!name.trim()) { toast.error("Ingresa tu nombre"); setLoading(false); return }
      const { error } = await register(name.trim(), email, password)
      if (error) {
        toast.error(error.includes("already") ? "Este email ya tiene una cuenta." : "Error al crear cuenta.")
      } else {
        toast.success("¡Cuenta creada! Revisa tu email para confirmar.")
        setMode("login")
      }
    } else {
      const { error } = await forgotPassword(email)
      if (error) {
        toast.error("No se pudo enviar el email. Verifica la dirección.")
      } else {
        toast.success("Te enviamos un enlace para restablecer tu contraseña.")
        setMode("login")
      }
    }

    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    await loginWithGoogle()
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            {mode === "login" && "Bienvenido de vuelta"}
            {mode === "register" && "Crear cuenta"}
            {mode === "forgot" && "Recuperar contraseña"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {mode === "login" && "Ingresa a tu cuenta para continuar"}
            {mode === "register" && "Únete a la comunidad KOY"}
            {mode === "forgot" && "Te enviamos un enlace a tu email"}
          </p>
        </div>

        {/* Google (only for login/register) */}
        {mode !== "forgot" && (
          <Button variant="outline" className="w-full h-12 gap-3" onClick={handleGoogleLogin} disabled={loading}>
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continuar con Google
          </Button>
        )}

        {mode !== "forgot" && (
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">O continúa con email</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="name" placeholder="Tu nombre" value={name} onChange={(e) => setName(e.target.value)} className="h-12 pl-10" />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 pl-10" required />
            </div>
          </div>

          {mode !== "forgot" && (
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pl-10 pr-10"
                  required
                  minLength={6}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === "login" && (
            <div className="flex justify-end">
              <button type="button" onClick={() => setMode("forgot")} className="text-sm text-muted-foreground hover:text-foreground">
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          <Button type="submit" className="w-full h-12 gap-2" disabled={loading}>
            {loading ? "Procesando..." : (
              <>
                {mode === "login" && "Iniciar Sesión"}
                {mode === "register" && "Crear Cuenta"}
                {mode === "forgot" && "Enviar enlace"}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Toggle */}
        <div className="text-center text-sm text-muted-foreground space-y-2">
          {mode === "login" && (
            <p>¿No tienes cuenta?{" "}
              <button onClick={() => setMode("register")} className="font-medium text-foreground hover:underline">Regístrate</button>
            </p>
          )}
          {mode === "register" && (
            <p>¿Ya tienes cuenta?{" "}
              <button onClick={() => setMode("login")} className="font-medium text-foreground hover:underline">Inicia sesión</button>
            </p>
          )}
          {mode === "forgot" && (
            <p>
              <button onClick={() => setMode("login")} className="font-medium text-foreground hover:underline">Volver al inicio de sesión</button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
