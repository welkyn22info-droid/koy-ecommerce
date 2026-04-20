"use client"

import { useState } from "react"
import { User, Mail, Phone, MapPin, Save, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useStore } from "@/lib/store-context"

export function ProfileView() {
  const { user, setCurrentView } = useStore()
  const [saved, setSaved] = useState(false)

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "+57 310 555 1234",
    address: "Calle 100 #45-67, Apto 502",
    city: "Bogotá, Cundinamarca",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="container px-4 md:px-6 py-8 max-w-2xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => setCurrentView("home")}
        className="mb-8 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Button>

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="text-2xl">
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">Mis Datos</h1>
            <p className="text-muted-foreground">
              Administra tu información personal
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-6 border rounded-xl space-y-6">
            <h2 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Información Personal
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="h-12 pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="h-12 pl-10"
                />
              </div>
            </div>
          </div>

          <div className="p-6 border rounded-xl space-y-6">
            <h2 className="font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Dirección de Envío
            </h2>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad / Departamento</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="h-12"
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 gap-2">
            {saved ? (
              <>¡Guardado!</>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
