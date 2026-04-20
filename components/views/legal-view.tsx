"use client"

import { ArrowLeft, FileText, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store-context"

type LegalPage = "terminos" | "privacidad"

interface LegalViewProps {
  page: LegalPage
}

const PAGES: Record<LegalPage, { title: string; icon: React.ReactNode; content: React.ReactNode }> = {
  terminos: {
    title: "Términos de Servicio",
    icon: <FileText className="h-6 w-6" />,
    content: (
      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
        <p className="text-sm text-muted-foreground">Última actualización: abril de 2025</p>

        <Section title="1. Aceptación de Términos">
          Al acceder y utilizar el sitio web de KOY by m&m y realizar compras, aceptas estos Términos de Servicio en su totalidad. Si no estás de acuerdo con alguno de estos términos, te rogamos que no uses nuestros servicios.
        </Section>

        <Section title="2. Descripción del Servicio">
          KOY by m&m es una tienda en línea que comercializa buzos oversized con estampados de anime y cine, fabricados bajo demanda en Colombia. Los pedidos se producen después de confirmado el pago.
        </Section>

        <Section title="3. Proceso de Compra">
          <ul className="list-disc ml-4 space-y-1">
            <li>Los precios están expresados en Pesos Colombianos (COP) e incluyen IVA cuando aplica.</li>
            <li>Los pedidos se confirman únicamente después de recibir el pago aprobado por la pasarela Bold.</li>
            <li>KOY se reserva el derecho de cancelar pedidos en caso de error en precios o falta de inventario, realizando el reembolso completo.</li>
            <li>Una vez iniciada la producción, no se pueden realizar cambios en el pedido.</li>
          </ul>
        </Section>

        <Section title="4. Pagos">
          Los pagos se procesan exclusivamente a través de Bold, plataforma de pagos segura certificada. Aceptamos tarjeta débito/crédito, PSE, Nequi y Daviplata. KOY no almacena información financiera de sus clientes.
        </Section>

        <Section title="5. Envíos">
          KOY realiza envíos a todo el territorio nacional colombiano. Los tiempos de entrega son estimados y pueden variar por factores externos (clima, capacidad de la transportadora, etc.). KOY no se responsabiliza por demoras atribuibles a las transportadoras.
        </Section>

        <Section title="6. Cambios y Devoluciones">
          Aplica la política descrita en nuestra sección de Cambios y Devoluciones, en cumplimiento con la Ley 1480 de 2011 (Estatuto del Consumidor de Colombia).
        </Section>

        <Section title="7. Propiedad Intelectual">
          Los diseños, imágenes y contenidos del sitio son propiedad de KOY by m&m. Los estampados de anime y cine son creados con fines artísticos y no implican afiliación con los titulares de los derechos originales.
        </Section>

        <Section title="8. Limitación de Responsabilidad">
          KOY no será responsable por daños indirectos, incidentales o consecuentes derivados del uso o imposibilidad de uso de sus productos o servicios.
        </Section>

        <Section title="9. Modificaciones">
          KOY se reserva el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigencia al publicarse en el sitio web.
        </Section>

        <Section title="10. Contacto">
          Para cualquier consulta sobre estos términos: <a href="mailto:welkyn22.info@gmail.com" className="text-foreground underline">welkyn22.info@gmail.com</a>
        </Section>
      </div>
    ),
  },
  privacidad: {
    title: "Política de Privacidad",
    icon: <Shield className="h-6 w-6" />,
    content: (
      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
        <p className="text-sm text-muted-foreground">Última actualización: abril de 2025. Vigente según Ley 1581 de 2012 (Colombia).</p>

        <Section title="1. Responsable del Tratamiento">
          KOY by m&m, en adelante "KOY", con correo de contacto <a href="mailto:welkyn22.info@gmail.com" className="text-foreground underline">welkyn22.info@gmail.com</a>, es responsable del tratamiento de los datos personales recopilados a través de este sitio web.
        </Section>

        <Section title="2. Datos que Recopilamos">
          <ul className="list-disc ml-4 space-y-1">
            <li><strong>Datos de cuenta:</strong> nombre, correo electrónico y contraseña cifrada.</li>
            <li><strong>Datos de envío:</strong> dirección, ciudad, teléfono de contacto.</li>
            <li><strong>Datos de compra:</strong> historial de pedidos, productos adquiridos.</li>
            <li><strong>Datos técnicos:</strong> dirección IP, navegador, dispositivo (analytics).</li>
          </ul>
          <p className="mt-2">No almacenamos datos de tarjetas de crédito ni información financiera. Estos son procesados directamente por Bold.</p>
        </Section>

        <Section title="3. Finalidad del Tratamiento">
          <ul className="list-disc ml-4 space-y-1">
            <li>Gestionar tu cuenta y pedidos.</li>
            <li>Procesar pagos y coordinar envíos.</li>
            <li>Enviarte confirmaciones de pedido y actualizaciones de envío.</li>
            <li>Mejorar nuestros productos y servicios.</li>
            <li>Cumplir obligaciones legales y fiscales.</li>
          </ul>
        </Section>

        <Section title="4. Base Legal">
          El tratamiento de datos se realiza con base en: (a) la ejecución del contrato de compraventa, (b) tu consentimiento expreso al crear tu cuenta, y (c) obligaciones legales aplicables.
        </Section>

        <Section title="5. Compartición de Datos">
          KOY no vende ni cede tus datos a terceros con fines comerciales. Podemos compartir datos con:
          <ul className="list-disc ml-4 space-y-1 mt-2">
            <li><strong>Bold:</strong> procesamiento de pagos.</li>
            <li><strong>Transportadoras:</strong> solo nombre y dirección para gestionar el envío.</li>
            <li><strong>Supabase:</strong> almacenamiento seguro de datos (servidores en Sao Paulo, Brasil).</li>
            <li><strong>Autoridades:</strong> cuando exista obligación legal.</li>
          </ul>
        </Section>

        <Section title="6. Conservación de Datos">
          Conservamos tus datos mientras mantengas una cuenta activa. Los datos de pedidos se conservan por 5 años para cumplir obligaciones fiscales. Puedes solicitar la eliminación de tu cuenta enviando un correo a <a href="mailto:welkyn22.info@gmail.com" className="text-foreground underline">welkyn22.info@gmail.com</a>.
        </Section>

        <Section title="7. Tus Derechos (Ley 1581 de 2012)">
          Tienes derecho a conocer, actualizar, rectificar y suprimir tus datos personales, así como revocar tu consentimiento. Para ejercer estos derechos, escríbenos a <a href="mailto:welkyn22.info@gmail.com" className="text-foreground underline">welkyn22.info@gmail.com</a>. Responderemos en un plazo máximo de 15 días hábiles.
        </Section>

        <Section title="8. Cookies">
          Usamos cookies técnicas necesarias para el funcionamiento del sitio (sesión de usuario, carrito). No usamos cookies de rastreo de terceros con fines publicitarios sin tu consentimiento.
        </Section>

        <Section title="9. Seguridad">
          Implementamos medidas técnicas y organizativas para proteger tus datos: conexiones HTTPS, base de datos con control de acceso por filas (RLS), contraseñas cifradas. Sin embargo, ningún sistema es 100% seguro.
        </Section>

        <Section title="10. Cambios a esta Política">
          Podemos actualizar esta política periódicamente. Te notificaremos cambios significativos por correo electrónico.
        </Section>
      </div>
    ),
  },
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <div className="text-sm">{children}</div>
    </div>
  )
}

export function LegalView({ page }: LegalViewProps) {
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
