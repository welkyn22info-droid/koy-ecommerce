import { Suspense } from "react"
import ConfirmacionContent from "./content"

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Verificando pago...</div>
      </div>
    }>
      <ConfirmacionContent />
    </Suspense>
  )
}
