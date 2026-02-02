'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';

// TODO: VERIFICAR SI LOS NOMBRES DE LOS CAMPOS (name, email, etc) COINCIDEN CON WORDPRESS
const CONTACT_FORM_ID = 16907;

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: CONTACT_FORM_ID,
          data: {
            // Mapeo hipotético - Se debe ajustar según los "Field Names" del JFB en WP
            nombre: formData.name,
            email: formData.email,
            telefono: formData.phone,
            asunto: formData.subject,
            mensaje: formData.message,
            // Algunos JFB requieren nombres especificos como 'text-field-1', etc.
            // Pendiente confirmar con el usuario.
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setErrorMsg(result.message || 'Error al enviar el mensaje.');
      }

    } catch (err) {
      setErrorMsg('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO SECTION */}
      <div className="bg-[var(--color-pharma-blue)] py-16 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Contáctanos</h1>
          <p className="text-blue-100 max-w-2xl mx-auto text-lg">
            Estamos aquí para ayudarte. Escríbenos y nuestro equipo te responderá lo antes posible.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 -mt-8 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* INFORMACIÓN DE CONTACTO */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-[var(--color-pharma-blue)]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Línea Nacional</h3>
              <p className="text-gray-600 mb-4 text-sm">Lunes a Viernes 7:00 am - 6:00 pm<br />Sábados 8:00 am - 12:00 pm</p>
              <a href="tel:6015934005" className="text-2xl font-bold text-[var(--color-pharma-blue)] hover:underline">
                (601) 593 4005
              </a>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-[var(--color-pharma-green)]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Correo Electrónico</h3>
              <p className="text-gray-600 mb-4 text-sm">Para consultas generales y soporte.</p>
              <a href="mailto:atencionalusuario@pharmaplus.com.co" className="text-[var(--color-pharma-green)] font-semibold hover:underline break-words">
                atencionalusuario@pharmaplus.com.co
              </a>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Sede Principal</h3>
              <p className="text-gray-600 text-sm">
                Calle 86 # 27-54<br />
                Bogotá D.C., Colombia
              </p>
            </div>
          </div>

          {/* FORMULARIO */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <MessageCircle className="w-6 h-6 text-[var(--color-pharma-blue)]" />
                Envíanos un mensaje
              </h2>

              {success ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-in fade-in zoom-in duration-300">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-green-800 mb-2">¡Mensaje Enviado!</h3>
                  <p className="text-green-700">
                    Gracias por contactarnos. Hemos recibido tu mensaje y te responderemos a la brevedad posible.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {errorMsg && (
                    <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm mb-4">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Nombre Completo *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[var(--color-pharma-blue)] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Teléfono / Celular</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[var(--color-pharma-blue)] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        placeholder="300 123 4567"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Correo Electrónico *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[var(--color-pharma-blue)] focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                      placeholder="tucorreo@ejemplo.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Asunto *</label>
                    <select
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[var(--color-pharma-blue)] focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
                    >
                      <option value="">Selecciona un asunto</option>
                      <option value="Servicio al Cliente">Servicio al Cliente</option>
                      <option value="Pedidos y Domicilios">Pedidos y Domicilios</option>
                      <option value="Convenios">Convenios Empresariales</option>
                      <option value="Reclamos">Quejas y Reclamos (PQRS)</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Mensaje *</label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[var(--color-pharma-blue)] focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                      placeholder="¿En qué podemos ayudarte?"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[var(--color-pharma-blue)] text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/10 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                  >
                    {loading ? (
                      'Enviando...'
                    ) : (
                      <>
                        Enviar Mensaje
                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}