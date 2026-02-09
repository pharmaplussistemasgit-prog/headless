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
    <div className="min-h-screen bg-white">
      {/* HERO SECTION - Keep it but maybe simpler or just the header */}
      <div className="bg-white py-12 px-4 text-center border-b border-gray-100">
        <h1 className="text-4xl font-bold text-[var(--color-pharma-green)] mb-4">Contáctenos</h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          Bienvenido a <span className="font-bold text-[var(--color-pharma-blue)]">Pharmaplus</span>, estamos aquí para ayudarte. <br />
          Completa el formulario a continuación, y nos pondremos en contacto contigo lo antes posible.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-12">

          {/* FORMULARIO - Centered or Prominent */}
          <div className="lg:col-span-10 lg:col-start-2">
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
                  className="mt-6 px-6 py-2 bg-[var(--color-pharma-green)] text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm mb-4">
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-1">
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded border border-blue-100 focus:border-[var(--color-pharma-blue)] outline-none transition-all placeholder-blue-300 text-blue-900"
                    placeholder="Nombres"
                  />
                </div>

                <div className="space-y-1">
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded border border-blue-100 focus:border-[var(--color-pharma-blue)] outline-none transition-all placeholder-blue-300 text-blue-900"
                    placeholder="Email"
                  />
                </div>

                <div className="space-y-1">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded border border-blue-100 focus:border-[var(--color-pharma-blue)] outline-none transition-all placeholder-blue-300 text-blue-900"
                    placeholder="Teléfono"
                  />
                </div>

                <div className="space-y-1">
                  <input
                    type="hidden"
                    name="subject"
                    value="Contacto desde Web"
                  />
                </div>

                <div className="space-y-1">
                  <textarea
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded border border-blue-100 focus:border-[var(--color-pharma-blue)] outline-none transition-all placeholder-blue-300 text-blue-900 resize-none"
                    placeholder="Mensaje"
                  ></textarea>
                </div>

                <div className="pt-4 flex justify-center lg:justify-start">
                  {/* Screenshot shows button bottom left or full width? Screenshot cut off. 
                      User said "boton verde". I will make it full width or consistent. 
                      Standard clean forms often have it left or centered. 
                  */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-12 py-3 bg-[var(--color-pharma-green)] text-white font-bold rounded hover:bg-green-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* INFO LATERAL (Opcional, maybe below or removed if mimicking exact simple form?) 
               User said "Incluir formularios... con los mismos campos". 
               I'll keep the contact details below or to the side but simplified.
           */}
          <div className="lg:col-span-12 mt-12 grid md:grid-cols-3 gap-6 text-center border-t border-gray-100 pt-8">
            <div>
              <h4 className="font-bold text-[var(--color-pharma-blue)]">Calle 86 # 27-54</h4>
              <p className="text-sm text-gray-500">Bogotá D.C., Colombia</p>
            </div>
            <div>
              <h4 className="font-bold text-[var(--color-pharma-blue)]">(601) 593 4005</h4>
              <p className="text-sm text-gray-500">Línea Nacional</p>
            </div>
            <div>
              <h4 className="font-bold text-[var(--color-pharma-green)]">atencionalusuario@pharmaplus.com.co</h4>
              <p className="text-sm text-gray-500">Email de Soporte</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}