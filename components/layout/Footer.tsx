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
            {/* CTA Button */}
            <div className="pt-6 flex justify-center">
              <Link
                href="/pastillero"
                className="bg-[var(--color-pharma-green)] text-white text-lg px-10 py-4 rounded-full font-extrabold hover:bg-green-500 transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-3 group border-2 border-green-400/30"
              >
                Ingresar a mi Pastillero
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>

            {/* Privacy Note */}
            <p className="text-xs text-blue-200 pt-4 opacity-80">
              🔒 Acceso seguro y privado. Tus datos de salud están protegidos.
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

                <div className="flex gap-4 pt-2 items-center">
                  <Link href="https://web.facebook.com/profile.php?id=61573973515459" target="_blank" className="text-blue-200 hover:text-white transition-colors hover:scale-110" aria-label="Síguenos en Facebook">
                    <Facebook className="w-6 h-6" />
                  </Link>
                  <Link href="https://www.instagram.com/pharmapluscolombia/" target="_blank" className="text-blue-200 hover:text-white transition-colors hover:scale-110" aria-label="Síguenos en Instagram">
                    <Instagram className="w-6 h-6" />
                  </Link>
                  <Link href="/contacto" className="hover:scale-110 transition-transform" aria-label="Escríbenos por WhatsApp">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://tienda.pharmaplus.com.co/wp-content/uploads/elementor/thumbs/Whatsapp-rd7cxj0k3c24bqbqf6c65a5tulhs2kwxhcpb8hbib8.png"
                      alt="Whatsapp"
                      className="w-8 h-8 object-contain"
                    />
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
                  <li><Link href="/preguntas-frecuentes" className="text-sm text-blue-100 hover:text-[var(--color-pharma-green)] transition-colors">Preguntas Frecuentes</Link></li>
                  <li><Link href="/politicas/terminos-condiciones" className="text-sm text-blue-100 hover:text-[var(--color-pharma-green)] transition-colors">Términos y Condiciones</Link></li>
                  <li><Link href="/politicas/politicas-devolucion" className="text-sm text-blue-100 hover:text-[var(--color-pharma-green)] transition-colors">Políticas de Devoluciones</Link></li>
                  <li><Link href="/politicas/proteccion-datos" className="text-sm text-blue-100 hover:text-[var(--color-pharma-green)] transition-colors">Política de Protección de Datos</Link></li>
                  <li><Link href="/politicas/aviso-privacidad" className="text-sm text-blue-100 hover:text-[var(--color-pharma-green)] transition-colors">Aviso de Privacidad</Link></li>
                  <li><Link href="/politicas/preferencias-cookies" className="text-sm text-blue-100 hover:text-[var(--color-pharma-green)] transition-colors">Preferencias de Cookies</Link></li>
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
                  <li><Link href="/wishlist" className="text-sm text-blue-100 hover:text-[var(--color-pharma-green)] transition-colors">Lista de deseos</Link></li>
                  <li><Link href="/reversion" className="text-sm text-blue-100 hover:text-[var(--color-pharma-green)] transition-colors">Reversión de pago</Link></li>
                </ul>

                {/* PAYMENT METHODS SECTION - GRID */}
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-pharma-green)] uppercase tracking-wider mb-4 text-center md:text-left">
                    Medios de Pago
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-1 rounded h-8 w-12 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="https://tienda.pharmaplus.com.co/wp-content/uploads/2025/08/Visa.png" alt="Visa" className="max-h-full max-w-full" />
                    </div>
                    <div className="bg-white p-1 rounded h-8 w-12 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="https://tienda.pharmaplus.com.co/wp-content/uploads/2025/08/Mastercard.png" alt="Mastercard" className="max-h-full max-w-full" />
                    </div>
                    <div className="bg-white p-1 rounded h-8 w-12 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="https://tienda.pharmaplus.com.co/wp-content/uploads/2025/08/PSE.png" alt="PSE" className="max-h-full max-w-full" />
                    </div>
                    <div className="bg-white p-1 rounded h-8 w-12 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="https://tienda.pharmaplus.com.co/wp-content/uploads/2025/08/Diners.png" alt="Diners" className="max-h-full max-w-full" />
                    </div>
                    <div className="bg-white p-1 rounded h-8 w-12 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="https://tienda.pharmaplus.com.co/wp-content/uploads/2025/08/Contra-Entrega.png" alt="Contra Entrega" className="max-h-full max-w-full" />
                    </div>
                    <div className="bg-white p-1 rounded h-8 w-12 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="https://tienda.pharmaplus.com.co/wp-content/uploads/2025/08/Transferencia_Bancaria.png" alt="Transferencia" className="max-h-full max-w-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 3. BOTTOM BAR - DARKEST BLUE */}
      <div className="bg-[#002661] py-8 border-t border-white/10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-base font-bold text-white leading-relaxed">
            © 2025 PharmaPlus S.A.S. Todos los derechos reservados. | Desarrollado por iAnGo - Agencia de Desarrollo e Implementaciones con IA
          </p>
        </div>
      </div>
    </footer>
  );
}
