import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Phone, Mail, MapPin, Truck, ShieldCheck, Clock, MessageCircle, Send, CreditCard } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full">
      {/* 1. NEWSLETTER SECTION - ELECTRIC BLUE */}
      <div className="relative bg-[var(--color-pharma-blue)] py-10 border-b border-blue-500/30 overflow-hidden">
        {/* Decorative Elements - Subtle Glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--color-pharma-green)] opacity-20 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">

            {/* Icon + Title */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-white/10 p-3 rounded-2xl shadow-lg backdrop-blur-sm">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                El Pastillero <span className="text-[var(--color-pharma-green)]">Virtual</span>
              </h2>
            </div>

            {/* Subtitle */}
            <p className="text-blue-100 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              <span className="font-semibold text-white">No olvides tu dosis de bienestar.</span> Recibe recordatorios personalizados, ofertas exclusivas y consejos de salud certificados por expertos.
            </p>

            {/* Benefits Pills */}
            <div className="flex flex-wrap justify-center gap-3 py-4">
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium text-white shadow-sm border border-white/20">
                <svg className="w-4 h-4 text-[var(--color-pharma-green)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Recordatorios de medicamentos
              </span>
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium text-white shadow-sm border border-white/20">
                <svg className="w-4 h-4 text-[var(--color-pharma-green)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Ofertas personalizadas
              </span>
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium text-white shadow-sm border border-white/20">
                <svg className="w-4 h-4 text-[var(--color-pharma-green)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Consejos de expertos
              </span>
            </div>

            {/* Form */}
            <form className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3 pt-2">
              <input
                type="email"
                placeholder="tucorreo@ejemplo.com"
                className="flex-1 bg-white/10 border-2 border-white/20 rounded-full px-6 py-4 text-sm focus:outline-none focus:border-white focus:bg-white/20 shadow-sm text-white placeholder-blue-200 transition-all font-medium"
              />
              <button
                type="submit"
                className="bg-[var(--color-pharma-green)] text-white px-8 py-4 rounded-full font-bold hover:bg-green-500 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
              >
                Suscribirme Ahora
                <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            {/* Privacy Note */}
            <p className="text-xs text-blue-200 pt-2 opacity-80">
              🔒 Tus datos están protegidos. Puedes cancelar tu suscripción en cualquier momento.
            </p>
          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER CONTENT - DARK BLUE */}
      <div className="bg-[#003B95] pt-16 pb-12 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 text-center justify-items-center">

            {/* COLUMN 1: BRAND & SOCIALS */}
            <div className="flex flex-col items-center w-full">
              <div className="w-full md:w-fit text-left space-y-6">
                <div>
                  {/* Logo with filter for White color */}
                  <Link href="/">
                    <Image
                      src="/brand/logo-new-clean.png"
                      alt="PharmaPlus"
                      width={180}
                      height={60}
                      className="h-12 w-auto brightness-0 invert opacity-90 hover:scale-105 hover:opacity-100 transition-all duration-300"
                      priority
                    />
                  </Link>
                </div>

                <div className="space-y-2 text-sm text-blue-100">
                  <p>NIT 830.110.109-7</p>
                  <p>Calle 123 # 45-67, Bogotá D.C.</p>
                  <p>Colombia, Suramérica</p>
                </div>

                <div>
                  <Link href="/tiendas" className="inline-flex text-sm text-white underline font-medium hover:text-[var(--color-pharma-green)]">
                    Ver ubicaciones en mapa
                  </Link>
                  <Link href="/nosotros" className="block mt-2 text-sm text-white font-bold hover:text-[var(--color-pharma-green)] transition-colors">
                    Quiénes somos
                  </Link>
                  <Link href="/trabaja-con-nosotros" className="block mt-2 text-sm text-white font-bold hover:text-[var(--color-pharma-green)] transition-colors">
                    Trabaja con nosotros
                  </Link>
                </div>

                <div className="flex gap-3 pt-2">
                  <Link href="#" className="text-blue-200 hover:text-white transition-colors" aria-label="Síguenos en Facebook">
                    <Facebook className="w-5 h-5" />
                  </Link>
                  <Link href="#" className="text-blue-200 hover:text-white transition-colors" aria-label="Síguenos en Instagram">
                    <Instagram className="w-5 h-5" />
                  </Link>
                  <Link href="#" className="text-blue-200 hover:text-white transition-colors" aria-label="Escríbenos por WhatsApp">
                    <MessageCircle className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* COLUMN 2: HELP & CONTACT (Highlighted) */}
            <div className="flex flex-col items-center w-full">
              <div className="w-full md:w-fit text-left flex flex-col md:block items-center md:items-start">
                <h3 className="text-sm font-bold text-[var(--color-pharma-green)] uppercase tracking-wider mb-6 text-center md:text-left w-full">
                  ¿Necesitas Ayuda?
                </h3>

                <div className="space-y-6 w-full">
                  <div>
                    <Link href="tel:6015934005" className="block text-2xl md:text-3xl font-bold text-white hover:text-[var(--color-pharma-green)] transition-colors">
                      (601) 593 4005
                    </Link>
                    <span className="text-xs text-blue-200 mt-1 block">Línea de atención nacional</span>
                  </div>

                  <div className="space-y-1 text-sm text-blue-100">
                    <p><span className="font-semibold text-white">Lunes - Viernes:</span> 7:00 am - 9:00 pm</p>
                    <p><span className="font-semibold text-white">Sábados:</span> 8:00 am - 8:00 pm</p>
                  </div>

                  <Link href="mailto:atencionalusuario@pharmaplus.com.co" className="flex items-center gap-2 text-sm text-white hover:underline break-words hover:text-[var(--color-pharma-green)] transition-colors">
                    <Mail className="w-4 h-4 shrink-0" />
                    <span className="truncate">atencionalusuario@pharmaplus.com.co</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* COLUMN 3: INFORMATION LINKS */}
            <div className="flex flex-col items-center w-full">
              <div className="w-full md:w-fit text-left">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 text-center md:text-left">
                  <Link href="/politicas" className="hover:text-[var(--color-pharma-green)] transition-colors">
                    Centro de Políticas y Legales
                  </Link>
                </h3>
                <ul className="space-y-3 w-full">
                  <li><Link href="/politicas/preguntas-frecuentes" className="text-sm text-blue-100 hover:text-[var(--color-pharma-green)] transition-colors">Preguntas Frecuentes</Link></li>
                  <li><Link href="/politicas/terminos-condiciones" className="text-sm text-blue-100 hover:text-[var(--color-pharma-green)] transition-colors">Términos y Condiciones</Link></li>
                  <li><Link href="/politicas/politicas-devolucion" className="text-sm text-blue-100 hover:text-[var(--color-pharma-green)] transition-colors">Políticas de Devoluciones</Link></li>
                  <li><Link href="/politicas/proteccion-datos" className="text-sm text-blue-100 hover:text-[var(--color-pharma-green)] transition-colors">Política de Protección de Datos</Link></li>
                  <li><Link href="/politicas/aviso-privacidad" className="text-sm text-blue-100 hover:text-[var(--color-pharma-green)] transition-colors">Aviso de Privacidad</Link></li>
                </ul>
              </div>
            </div>

            {/* COLUMN 4: ACCOUNT & SERVICES */}
            <div className="flex flex-col items-center w-full">
              <div className="w-full md:w-fit text-left">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 text-center md:text-left">
                  Mi Cuenta
                </h3>
                <ul className="space-y-3 w-full">
                  <li><Link href="/mi-cuenta" className="text-sm text-blue-100 hover:text-[var(--color-pharma-green)] transition-colors">Panel de control</Link></li>
                  <li><Link href="/mi-cuenta/pedidos" className="text-sm text-blue-100 hover:text-[var(--color-pharma-green)] transition-colors">Mis pedidos</Link></li>
                  <li><Link href="/carrito" className="text-sm text-blue-100 hover:text-[var(--color-pharma-green)] transition-colors">Carrito de compras</Link></li>
                  <li><Link href="/lista-deseos" className="text-sm text-blue-100 hover:text-[var(--color-pharma-green)] transition-colors">Lista de deseos</Link></li>
                  <li><Link href="/reversion" className="text-sm text-blue-100 hover:text-[var(--color-pharma-green)] transition-colors">Reversión de pago</Link></li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 3. BOTTOM BAR - DARKEST BLUE */}
      <div className="bg-[#002661] py-8 border-t border-white/10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <p className="text-base font-bold text-white leading-relaxed">
            © 2025 PharmaPlus S.A.S. Todos los derechos reservados.<br className="md:hidden" /> Desarrollado por iAnGo - Agencia de Desarrollo e Implementaciones con IA
          </p>

          <div className="flex items-center justify-center gap-4 opacity-90 hover:opacity-100 transition-all">
            {/* Payment Icons Placeholder */}
            <div className="flex gap-2">
              <span className="text-[10px] font-bold text-[#1A1F71] bg-white px-2 py-1 rounded shadow-sm">VISA</span>
              <span className="text-[10px] font-bold text-[#EB001B] bg-white px-2 py-1 rounded shadow-sm">MC</span>
              <span className="text-[10px] font-bold text-[#006FCF] bg-white px-2 py-1 rounded shadow-sm">AMEX</span>
              <span className="text-[10px] font-bold text-[var(--color-pharma-blue)] bg-white px-2 py-1 rounded shadow-sm">PSE</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
