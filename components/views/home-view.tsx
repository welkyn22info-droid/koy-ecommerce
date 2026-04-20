"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Sparkles, Truck, Shield, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store-context"
import { ImmersiveCarousel } from "@/components/immersive-carousel"

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

function RevealSection({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function HomeView() {
  const { setCurrentView, setCategoryFilter, homeConfig } = useStore()
  const heroRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const blobY1 = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"])
  const blobY2 = useTransform(scrollYProgress, [0, 1], ["0%", "20%"])

  const handleShopNow = () => {
    setCurrentView("catalog")
    setCategoryFilter(null)
  }

  return (
    <div className="flex flex-col overflow-hidden">

      {/* ── HERO + CARRUSEL (todo visible al abrir) ────────── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center overflow-hidden pb-8">
        {/* Background blobs parallax */}
        <motion.div style={{ y: blobY1 }} className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-foreground/[0.04] rounded-full blur-3xl" />
        </motion.div>
        <motion.div style={{ y: blobY2 }} className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-foreground/[0.04] rounded-full blur-3xl" />
        </motion.div>

        {/* Hero BG image (CMS) */}
        {homeConfig.heroBgImage && (
          <motion.div style={{ y: heroY }} className="absolute inset-0 pointer-events-none">
            <img src={homeConfig.heroBgImage} alt="Hero" className="w-full h-full object-cover opacity-15" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background" />
          </motion.div>
        )}

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 flex flex-col items-center gap-10 pt-8">

          {/* Text + CTAs */}
          <RevealSection className="flex flex-col items-center text-center max-w-4xl mx-auto px-4 space-y-6">
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 bg-foreground/5 border border-foreground/10 rounded-full text-sm font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              Nueva Colección 2024
            </motion.span>

            <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.9] text-balance">
              {homeConfig.heroTitle.split(" ").slice(0, 4).join(" ")}
              <span className="block text-foreground/55 mt-1">
                {homeConfig.heroTitle.split(" ").slice(4).join(" ")}
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-base md:text-lg text-muted-foreground max-w-xl text-pretty">
              {homeConfig.heroSubtitle}
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" onClick={handleShopNow} className="gap-2 px-8 rounded-xl">
                {homeConfig.heroCTAText} <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => { setCurrentView("catalog"); setCategoryFilter("anime") }} className="px-8 rounded-xl">
                Ver Anime
              </Button>
            </motion.div>

            <motion.div variants={fadeUp} className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex -space-x-1">
                {["#e87040","#6366f1","#10b981","#f59e0b"].map((c) => (
                  <div key={c} className="w-5 h-5 rounded-full border-2 border-background" style={{ backgroundColor: c }} />
                ))}
              </div>
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span><strong className="text-foreground">+200 fans</strong> ya tienen el suyo</span>
            </motion.div>
          </RevealSection>

          {/* Coverflow carousel — visible sin scroll */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            <ImmersiveCarousel />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-xs text-muted-foreground/60 md:hidden"
          >
            Toca el centro para ver detalles
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-xs text-muted-foreground/60 hidden md:block"
          >
            Haz clic en el centro para detalles · Las laterales avanzan el carrusel
          </motion.p>

        </motion.div>

        {/* Scroll hint */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground/40"
        >
          <div className="w-5 h-8 border border-muted-foreground/30 rounded-full flex justify-center pt-1.5">
            <div className="w-1 h-1.5 bg-muted-foreground/30 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ── TRUST STRIP ───────────────────────────────────── */}
      <RevealSection>
        <section className="py-12 border-y bg-secondary/10">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Sparkles, title: "Estampado Bajo Demanda", desc: "Cada pieza es única, impresa especialmente para ti" },
                { icon: Truck, title: "Envío a Todo el País", desc: "Llegamos a cualquier ciudad de Colombia" },
                { icon: Shield, title: "Calidad Premium", desc: "Tela 100% algodón con estampado de alta durabilidad" },
              ].map(({ icon: Icon, title, desc }) => (
                <motion.div key={title} variants={fadeUp} className="flex items-start gap-4 p-6 rounded-2xl hover:bg-secondary/30 transition-colors">
                  <div className="w-11 h-11 rounded-xl bg-foreground/5 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{title}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>


      {/* ── CATEGORIES SPLIT ──────────────────────────────── */}
      <RevealSection>
        <section className="py-20 bg-secondary/10">
          <div className="container px-4 md:px-6">
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black tracking-tight text-center mb-12">
              Elige tu universo
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { label: "Colección Anime", filter: "anime", img: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=900&h=600&fit=crop", accent: "#6366f1" },
                { label: "Colección Cine", filter: "cine", img: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=900&h=600&fit=crop", accent: "#f59e0b" },
              ].map(({ label, filter, img }) => (
                <motion.button
                  key={filter}
                  variants={fadeUp}
                  onClick={() => { setCurrentView("catalog"); setCategoryFilter(filter) }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="group relative h-80 overflow-hidden rounded-2xl text-left"
                >
                  <img
                    src={img}
                    alt={label}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute inset-0 flex flex-col items-start justify-end p-8 text-white">
                    <h3 className="text-3xl font-black mb-2">{label}</h3>
                    <span className="flex items-center gap-2 text-sm font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                      Explorar colección <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <RevealSection>
        <section className="py-24">
          <div className="container px-4 md:px-6 max-w-4xl mx-auto">
            <motion.div variants={fadeUp} className="text-center mb-16">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-3">Proceso</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight">Así de fácil</h2>
            </motion.div>
            <div className="relative">
              {/* Connector line */}
              <div className="absolute top-8 left-[calc(16.66%+16px)] right-[calc(16.66%+16px)] h-px bg-border hidden md:block" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { step: "01", title: "Elige tu buzo", desc: "Selecciona la base, talla y colores que quieres." },
                  { step: "02", title: "Personaliza el diseño", desc: "Elige entre decenas de estampados exclusivos." },
                  { step: "03", title: "Recibe en casa", desc: "Lo imprimimos y enviamos a cualquier ciudad." },
                ].map(({ step, title, desc }) => (
                  <motion.div key={step} variants={fadeUp} className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-foreground text-background flex items-center justify-center text-xl font-black mb-4 relative z-10">
                      {step}
                    </div>
                    <h3 className="font-bold text-lg mb-2">{title}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            <motion.div variants={fadeUp} className="text-center mt-12">
              <Button size="lg" onClick={handleShopNow} className="gap-2 rounded-xl px-8">
                Comenzar ahora <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </section>
      </RevealSection>

      {/* ── NEWSLETTER ────────────────────────────────────── */}
      <RevealSection>
        <section className="py-20 bg-foreground text-background">
          <div className="container px-4 md:px-6">
            <div className="max-w-2xl mx-auto text-center">
              <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                Únete a la comunidad
              </motion.h2>
              <motion.p variants={fadeUp} className="text-background/70 mb-8">
                Sé el primero en conocer nuevos diseños y ofertas exclusivas
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="flex-1 px-4 py-3 rounded-xl bg-background/10 border border-background/20 text-background placeholder:text-background/40 focus:outline-none focus:ring-2 focus:ring-background/30"
                />
                <Button size="lg" variant="secondary" className="rounded-xl px-6">
                  Suscribirse
                </Button>
              </motion.div>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="border-t py-12">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black">KOY</span>
                <span className="text-xs font-medium text-muted-foreground tracking-widest">by m&m</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Buzos oversized con diseños únicos para los verdaderos fans.
              </p>
              <a href="mailto:welkyn22.info@gmail.com" className="text-xs text-muted-foreground hover:text-foreground mt-3 block transition-colors">
                welkyn22.info@gmail.com
              </a>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Tienda</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button className="hover:text-foreground transition-colors" onClick={() => setCurrentView("catalog")}>Catálogo</button></li>
                <li><button className="hover:text-foreground transition-colors" onClick={() => { setCurrentView("catalog"); setCategoryFilter("anime") }}>Anime</button></li>
                <li><button className="hover:text-foreground transition-colors" onClick={() => { setCurrentView("catalog"); setCategoryFilter("cine") }}>Cine</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button className="hover:text-foreground transition-colors" onClick={() => setCurrentView("support-contacto")}>Contacto</button></li>
                <li><button className="hover:text-foreground transition-colors" onClick={() => setCurrentView("support-envios")}>Envíos</button></li>
                <li><button className="hover:text-foreground transition-colors" onClick={() => setCurrentView("support-devoluciones")}>Devoluciones</button></li>
                <li><button className="hover:text-foreground transition-colors" onClick={() => setCurrentView("support-faq")}>FAQ</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button className="hover:text-foreground transition-colors" onClick={() => setCurrentView("legal-terminos")}>Términos de Servicio</button></li>
                <li><button className="hover:text-foreground transition-colors" onClick={() => setCurrentView("legal-privacidad")}>Política de Privacidad</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            © 2025 KOY by m&m. Todos los derechos reservados. · Colombia
          </div>
        </div>
      </footer>

    </div>
  )
}
