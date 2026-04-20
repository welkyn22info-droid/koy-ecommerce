"use client"

import { ArrowLeft, Mail, Clock, Package, RefreshCw, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store-context"

type SupportPage = "contacto" | "envios" | "devoluciones" | "faq"

interface SupportViewProps {
  page: SupportPage
}

const PAGES: Record<SupportPage, { title: string; icon: React.ReactNode; content: React.ReactNode }> = {
  contacto: {
    title: "Contacto",
    icon: <Mail className="h-6 w-6" />,
    content: (
      <div className="space-y-6">
        <p className="text-muted-foreground text-lg">
          ¿Tienes preguntas sobre tu pedido o nuestros productos? Escríbenos y te respondemos a la brevedad.
        </p>
        <div className="p-6 bg-secondary/30 rounded-2xl space-y-4">
          <div>
            <p className="font-semibold mb-1">Correo electrónico</p>
            <a href="mailto:welkyn22.info@gmail.com" className="text-foreground underline text-lg">
              welkyn22.info@gmail.com
            </a>
          </div>
          <div>
            <p className="font-semibold mb-1">Horario de atención</p>
            <p className="text-muted-foreground">Lunes a viernes, 9:00 am – 6:00 pm (Colombia)</p>
          </div>
          <div>
            <p className="font-semibold mb-1">Tiempo de respuesta</p>
            <p className="text-muted-foreground">Máximo 24 horas hábiles</p>
          </div>
        </div>
        <div className="p-4 border rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <p className="font-medium text-sm">Incluye en tu mensaje</p>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
            <li>Número de pedido (ej: KOY-0001)</li>
            <li>Descripción del inconveniente o pregunta</li>
            <li>Fotos si aplica (problemas con el producto)</li>
          </ul>
        </div>
      </div>
    ),
  },
  envios: {
    title: "Información de Envíos",
    icon: <Package className="h-6 w-6" />,
    content: (
      <div className="space-y-6">
        <p className="text-muted-foreground text-lg">
          Hacemos envíos a todo Colombia a través de transportadoras nacionales como Servientrega y Coordinadora.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-secondary/30 rounded-2xl">
            <p className="font-semibold mb-2">Tiempo de entrega</p>
            <p className="text-muted-foreground text-sm">3 a 7 días hábiles dependiendo del destino.</p>
            <p className="text-muted-foreground text-sm mt-1">Ciudades principales: 2 a 4 días.</p>
          </div>
          <div className="p-5 bg-secondary/30 rounded-2xl">
            <p className="font-semibold mb-2">Costo de envío</p>
            <p className="text-muted-foreground text-sm">El costo varía según la ciudad de destino y el peso del pedido.</p>
            <p className="text-muted-foreground text-sm mt-1">Se calcula al finalizar el checkout.</p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">¿Cómo rastrear mi pedido?</h3>
          <p className="text-muted-foreground">
            Una vez despachado tu pedido, te enviaremos al correo el número de guía y la transportadora asignada. Puedes rastrear el envío directamente en el sitio web de la transportadora.
          </p>
        </div>

        <div className="p-4 border rounded-xl">
          <p className="font-medium mb-2">Importante</p>
          <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
            <li>El pedido se procesa después de confirmar el pago.</li>
            <li>Los tiempos de producción son de 2 a 4 días hábiles adicionales.</li>
            <li>Asegúrate de ingresar la dirección de envío completa y correcta.</li>
            <li>KOY no se responsabiliza por demoras causadas por la transportadora.</li>
          </ul>
        </div>
      </div>
    ),
  },
  devoluciones: {
    title: "Cambios y Devoluciones",
    icon: <RefreshCw className="h-6 w-6" />,
    content: (
      <div className="space-y-6">
        <p className="text-muted-foreground text-lg">
          Queremos que estés 100% satisfecho. Si hay algún inconveniente con tu pedido, estamos aquí para ayudarte.
        </p>

        <div className="space-y-4">
          <div className="p-5 bg-secondary/30 rounded-2xl">
            <p className="font-semibold mb-2">Plazo para solicitar devolución</p>
            <p className="text-muted-foreground text-sm">
              Tienes <strong>5 días hábiles</strong> a partir de la recepción del pedido para reportar cualquier inconveniente, según la Ley 1480 de 2011 (Estatuto del Consumidor, Colombia).
            </p>
          </div>

          <div className="p-5 bg-secondary/30 rounded-2xl">
            <p className="font-semibold mb-2">Casos cubiertos</p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
              <li>Producto con defecto de fabricación</li>
              <li>Talla incorrecta (error nuestro)</li>
              <li>Diseño diferente al pedido</li>
              <li>Producto dañado en el envío</li>
            </ul>
          </div>

          <div className="p-5 bg-secondary/30 rounded-2xl">
            <p className="font-semibold mb-2">Casos no cubiertos</p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
              <li>Cambio de opinión después de recibir el pedido</li>
              <li>Selección incorrecta de talla por parte del cliente</li>
              <li>Daños causados por el cliente</li>
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">¿Cómo solicito una devolución?</h3>
          <ol className="text-sm text-muted-foreground space-y-2 ml-4 list-decimal">
            <li>Escríbenos a <a href="mailto:welkyn22.info@gmail.com" className="text-foreground underline">welkyn22.info@gmail.com</a> con tu número de pedido.</li>
            <li>Adjunta fotos del producto mostrando el inconveniente.</li>
            <li>Nuestro equipo evaluará el caso y te dará respuesta en 24 horas hábiles.</li>
            <li>Si aplica la devolución, coordinamos el retiro del producto.</li>
          </ol>
        </div>

        <p className="text-sm text-muted-foreground">
          El costo del envío de retorno estará a cargo del cliente, excepto cuando el error sea nuestro.
        </p>
      </div>
    ),
  },
  faq: {
    title: "Preguntas Frecuentes",
    icon: <HelpCircle className="h-6 w-6" />,
    content: (
      <div className="space-y-6">
        {[
          {
            q: "¿Cuánto tiempo demora mi pedido?",
            a: "El proceso completo es: 1-2 días de producción + 3-7 días hábiles de envío según tu ciudad.",
          },
          {
            q: "¿Cómo sé qué talla elegir?",
            a: "Nuestros buzos son oversized por diseño. Si normalmente usas M, te recomendamos pedir M. Si prefieres un fit más holgado, sube una talla. Próximamente agregaremos una guía de tallas con medidas exactas.",
          },
          {
            q: "¿Puedo personalizar el diseño?",
            a: "Sí. Cada buzo tiene diferentes diseños disponibles que puedes seleccionar en la ficha del producto. Si quieres un diseño totalmente personalizado, escríbenos.",
          },
          {
            q: "¿Aceptan pagos en efectivo o contra entrega?",
            a: "No, únicamente aceptamos pagos en línea a través de Bold (tarjeta débito/crédito, PSE, Nequi y Daviplata). Esto garantiza mayor seguridad para ambas partes.",
          },
          {
            q: "¿Hacen envíos fuera de Colombia?",
            a: "Por el momento solo hacemos envíos dentro de Colombia. Estamos trabajando para expandir la cobertura próximamente.",
          },
          {
            q: "¿Cómo cuido mi buzo?",
            a: "Lavar a mano o en ciclo delicado, agua fría. No usar secadora. Planchar al revés a temperatura baja. Evitar blanqueadores para conservar el estampado.",
          },
          {
            q: "¿Puedo cancelar mi pedido?",
            a: "Puedes cancelar siempre que el pedido no haya entrado en producción. Escríbenos lo antes posible a welkyn22.info@gmail.com con tu número de pedido.",
          },
          {
            q: "No recibí mi email de confirmación, ¿qué hago?",
            a: "Revisa tu carpeta de spam. Si no está ahí, escríbenos a welkyn22.info@gmail.com con el número de pedido que te mostró la pantalla de confirmación.",
          },
        ].map(({ q, a }) => (
          <div key={q} className="border-b pb-5 last:border-0">
            <p className="font-semibold mb-2">{q}</p>
            <p className="text-muted-foreground text-sm">{a}</p>
          </div>
        ))}
      </div>
    ),
  },
}

export function SupportView({ page }: SupportViewProps) {
  const { setCurrentView } = useStore()
  const { title, icon, content } = PAGES[page]

  return (
    <div className="container px-4 md:px-6 py-8 max-w-3xl mx-auto">
      <Button variant="ghost" onClick={() => setCurrentView("home")} className="mb-8 gap-2">
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio
      </Button>

      <div className="flex items-center gap-3 mb-8">
        {icon}
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      </div>

      {content}
    </div>
  )
}
