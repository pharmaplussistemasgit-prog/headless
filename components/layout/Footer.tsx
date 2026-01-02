import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Phone, Mail, MapPin, Truck, ShieldCheck, Clock, MessageCircle, Send, CreditCard } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full">
      {/* 1. NEWSLETTER SECTION - "EL PASTILLERO VIRTUAL" */}
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 border-b border-gray-100 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-pharma-blue)] opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--color-pharma-green)] opacity-5 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">

            {/* Icon + Title */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-[var(--color-pharma-blue)] to-[var(--color-pharma-green)] p-3 rounded-2xl shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-pharma-blue)]">
                El Pastillero <span className="text-[var(--color-pharma-green)]">Virtual</span>
              </h2>
            </div>

            {/* Subtitle */}
            <p className="text-[var(--color-text-body)] text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              <span className="font-semibold text-[var(--color-pharma-blue)]">No olvides tu dosis de bienestar.</span> Recibe recordatorios personalizados, ofertas exclusivas y consejos de salud certificados por expertos.
            </p>

            {/* Benefits Pills */}
            <div className="flex flex-wrap justify-center gap-3 py-4">
              <span className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm font-medium text-[var(--color-pharma-blue)] shadow-sm border border-blue-100">
                <svg className="w-4 h-4 text-[var(--color-pharma-green)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Recordatorios de medicamentos
              </span>
              <span className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm font-medium text-[var(--color-pharma-blue)] shadow-sm border border-blue-100">
                <svg className="w-4 h-4 text-[var(--color-pharma-green)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Ofertas personalizadas
              </span>
              <span className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm font-medium text-[var(--color-pharma-blue)] shadow-sm border border-blue-100">
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
                className="flex-1 bg-white border-2 border-gray-200 rounded-full px-6 py-4 text-sm focus:outline-none focus:border-[var(--color-pharma-blue)] focus:ring-2 focus:ring-[var(--color-pharma-blue)]/20 shadow-sm text-gray-700 placeholder-gray-400 transition-all"
              />
              <button
                type="submit"
                className="bg-[var(--color-pharma-green)] text-white px-8 py-4 rounded-full font-semibold hover:opacity-90 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
              >
                Suscribirme Ahora
                <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            {/* Privacy Note */}
            <p className="text-xs text-gray-400 pt-2">
              🔒 Tus datos están protegidos. Puedes cancelar tu suscripción en cualquier momento.
            </p>
          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER CONTENT */}
      {/* Background: Pure White as per Propharm reference */}
      <div className="bg-white pt-16 pb-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 text-center md:text-left">

            {/* COLUMN 1: BRAND & SOCIALS */}
            <div className="space-y-6 flex flex-col items-center md:items-start">
              <div className="flex items-center justify-center md:justify-start">
                {/* PharmaPlus Logo */}
                <Link href="/">
                  <Image
                    src="/brand/logo-new-clean.png"
                    alt="PharmaPlus"
                    width={180}
                    height={60}
                    className="h-12 w-auto"
                    priority
                  />
                </Link>
              </div>

              <div className="space-y-2 text-sm text-[var(--color-text-body)]">
                <p>NIT 830.110.109-7</p>
                <p>Calle 123 # 45-67, Bogotá D.C.</p>
                <p>Colombia, Suramérica</p>
              </div>

              <Link href="/tiendas" className="inline-flex text-sm text-[var(--color-pharma-blue)] underline font-medium hover:text-[var(--color-pharma-green)]">
                Ver ubicaciones en mapa
              </Link>

              <div className="flex gap-3 pt-2 justify-center md:justify-start">
                <Link href="#" className="text-gray-400 hover:text-[var(--color-pharma-blue)] transition-colors">
                  <Facebook className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-[var(--color-pharma-blue)] transition-colors">
                  <Instagram className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-[var(--color-pharma-blue)] transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* COLUMN 2: HELP & CONTACT (Highlighted) */}
            <div className="flex flex-col items-center md:items-start">
              <h3 className="text-sm font-semibold text-[var(--color-pharma-green)] uppercase tracking-wider mb-6">
                ¿Necesitas Ayuda?
              </h3>

              <div className="space-y-6 w-full">
                <div>
                  <Link href="tel:6015934005" className="block text-2xl md:text-3xl font-bold text-[var(--color-pharma-blue)] hover:text-[var(--color-pharma-green)] transition-colors">
                    (601) 593 4005
                  </Link>
                  <span className="text-xs text-gray-400 mt-1 block">Línea de atención nacional</span>
                </div>

                <div className="space-y-1 text-sm text-[var(--color-text-body)]">
                  <p><span className="font-semibold text-gray-700">Lunes - Viernes:</span> 7:00 am - 9:00 pm</p>
                  <p><span className="font-semibold text-gray-700">Sábados:</span> 8:00 am - 8:00 pm</p>
                </div>

                <Link href="mailto:atencionalusuario@pharmaplus.com.co" className="flex items-center justify-center md:justify-start gap-2 text-sm text-[var(--color-pharma-blue)] hover:underline break-words">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span className="truncate">atencionalusuario@pharmaplus.com.co</span>
                </Link>
              </div>
            </div>

            {/* COLUMN 3: INFORMATION LINKS */}
            <div className="flex flex-col items-center md:items-start">
              <h3 className="text-sm font-semibold text-[var(--color-pharma-blue)] uppercase tracking-wider mb-6">
                Información
              </h3>
              <ul className="space-y-3 w-full">
                <li><Link href="/nosotros" className="text-sm text-gray-500 hover:text-[var(--color-pharma-blue)] transition-colors">Quiénes somos</Link></li>
                <li><Link href="/domicilios" className="text-sm text-gray-500 hover:text-[var(--color-pharma-blue)] transition-colors">Información de envíos</Link></li>
                <li><Link href="/politicas" className="text-sm text-gray-500 hover:text-[var(--color-pharma-blue)] transition-colors">Políticas de privacidad</Link></li>
                <li><Link href="/terminos" className="text-sm text-gray-500 hover:text-[var(--color-pharma-blue)] transition-colors">Términos y condiciones</Link></li>
                <li><Link href="/pqr" className="text-sm text-gray-500 hover:text-[var(--color-pharma-blue)] transition-colors">Peticiones, quejas y reclamos</Link></li>
              </ul>
            </div>

            {/* COLUMN 4: ACCOUNT & SERVICES */}
            <div className="flex flex-col items-center md:items-start">
              <h3 className="text-sm font-semibold text-[var(--color-pharma-blue)] uppercase tracking-wider mb-6">
                Mi Cuenta
              </h3>
              <ul className="space-y-3 w-full">
                <li><Link href="/mi-cuenta" className="text-sm text-gray-500 hover:text-[var(--color-pharma-blue)] transition-colors">Panel de control</Link></li>
                <li><Link href="/mi-cuenta/pedidos" className="text-sm text-gray-500 hover:text-[var(--color-pharma-blue)] transition-colors">Mis pedidos</Link></li>
                <li><Link href="/carrito" className="text-sm text-gray-500 hover:text-[var(--color-pharma-blue)] transition-colors">Carrito de compras</Link></li>
                <li><Link href="/lista-deseos" className="text-sm text-gray-500 hover:text-[var(--color-pharma-blue)] transition-colors">Lista de deseos</Link></li>
                <li><Link href="/reversion" className="text-sm text-gray-500 hover:text-[var(--color-pharma-blue)] transition-colors">Reversión de pago</Link></li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* 3. BOTTOM BAR: COPYRIGHT & PAYMENTS */}
      <div className="bg-[var(--color-pharma-green)] py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <p className="text-sm text-white opacity-90 leading-relaxed">
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
