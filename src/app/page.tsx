'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  Cpu,
  FileCheck2,
  CheckCircle2,
  Zap,
  ArrowRight,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  Info,
  Award,
  Users
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  badge: string;
  utility: string;
  desc: string;
  specs: string[];
}

const hardwareProducts: Product[] = [
  {
    id: 'mtoken',
    name: 'Token Criptográfico USB Hyperion',
    subtitle: 'Custodia Criptográfica de Alta Seguridad',
    image: '/assets/mtoken.jpg',
    badge: 'Hardware de Seguridad',
    utility: 'Diseñado para profesionales y empresas que emiten firmas digitales y comprobantes electrónicos. Impide físicamente la clonación, exportación o robo del certificado digital por malware.',
    desc: 'Dispositivo criptográfico con microcontrolador dedicado FIPS 140-2 Level 3. Almacena la clave privada de forma protegida bajo contraseña PIN/PUK.',
    specs: ['Estándar FIPS 140-2 Level 3', 'Clave privada no exportable', 'Compatible con Windows, macOS y Linux', 'Conexión USB estándar']
  },
  {
    id: 'desktop-vertical',
    name: 'Lector DNIe Vertical Desktop',
    subtitle: 'Estación de Firma para Escritorio',
    image: '/assets/BIGSINFONDO-1.jpg',
    badge: 'Uso Notarial y Bancario',
    utility: 'Ideal para notarías, estudios jurídicos y ventanillas de atención. Su diseño vertical y base pesada antideslizante permite insertar y retirar el DNIe con una sola mano sin mover el equipo.',
    desc: 'Lector de tarjetas inteligentes con inserción guiada. Evita el desgaste del chip del documento y garantiza una conexión estable en firmas de alto volumen.',
    specs: ['Inserción vertical asistida', 'Base antideslizante de alta estabilidad', 'Soporta DNIe 3.0 / 4.0 e ISO 7816', 'Indicador LED de lectura']
  },
  {
    id: 'cardmaster',
    name: 'Lector Multi-Ranura CardMaster Pro',
    subtitle: 'Estación Multifuncional Todo en Uno',
    image: '/assets/CARDMASTER-FONDO.jpg',
    badge: 'Multi-Uso Integral',
    utility: 'Perfecto para oficinas que requieren tanto autenticación con DNIe como lectura de memorias flash y tarjetas SIM de operadores en un único puerto.',
    desc: 'Hub integral con ranura para chip inteligente y bahías para tarjetas SD, MicroSD y tarjetas SIM, optimizando el espacio del escritorio.',
    specs: ['Ranura principal para DNI electrónico', 'Lector de tarjetas SD y MicroSD', 'Lectura de SIM Card', 'Conexión USB de alta velocidad']
  },
  {
    id: 'intellireader',
    name: 'Lector IntelliReader con Cable USB',
    subtitle: 'Lector Horizontal Robusto',
    image: '/assets/INTELLIREADERCONCABLEE.jpg',
    badge: 'Alta Precisión',
    utility: 'Excelente para autenticación en plataformas gubernamentales (SUNAT, RENIEC, OSCE, PJ). Brinda una conexión por cable estable y libre de interferencias.',
    desc: 'Dispositivo clásico de diseño plano con lector de chip integrado. Reconocimiento rápido y seguro para validación de identidad y firma de documentos electrónicos.',
    specs: ['Tecnología Plug & Play', 'Certificación PC/SC y CCID', 'Compatible con certificados RENIEC', 'Cable reforzado de 1.5 metros']
  },
  {
    id: 'mini-reader',
    name: 'Mini Lector SmartCard Circular Pro',
    subtitle: 'Ultra-portátil para Laptops',
    image: '/assets/MINI-LECTOR-PRO-HYPERION.jpg',
    badge: 'Movilidad y Viajes',
    utility: 'Pensado para auditores, abogados y ejecutivos que trabajan en movimiento o realizan home office. Ocupa el mínimo espacio en el maletín de la laptop.',
    desc: 'Lector circular ultracompacto con agarre perimetral para el documento de identidad. Combina portabilidad máxima con compatibilidad total con DNIe.',
    specs: ['Formato circular ultra-liviano', 'Bajo consumo de batería en laptops', 'Soporte DNI electrónico peruano', 'Conexión directa USB']
  }
];

export default function LandingPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 340;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-[#00b8b8]/20 selection:text-[#00668c]">
      {/* ==================== NAVBAR ==================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-11 h-11 flex-shrink-0">
              <Image
                src="/logo-hyperion.png"
                alt="Hyperion Digital Security"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 block leading-tight">
                HYPERION
              </span>
              <span className="text-[10px] font-bold tracking-widest text-[#00668c] uppercase block">
                Digital Security
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#servicios" className="hover:text-[#00668c] transition-colors">Servicios</a>
            <a href="#productos" className="hover:text-[#00668c] transition-colors">Productos & Hardware</a>
            <a href="#automatizacion" className="hover:text-[#00668c] transition-colors">Auto Cert</a>
            <a href="#nosotros" className="hover:text-[#00668c] transition-colors">Nosotros</a>
            <a href="#contacto" className="hover:text-[#00668c] transition-colors">Contacto</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00668c] hover:bg-[#005270] text-white text-xs font-bold transition-all shadow-md shadow-[#00668c]/25 hover:shadow-lg hover:shadow-[#00668c]/30"
            >
              <span>Acceso Clientes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24 bg-gradient-to-b from-white via-slate-50 to-slate-100/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-[#00668c] text-xs font-bold shadow-sm">
            <Zap className="w-3.5 h-3.5 text-[#00b8b8]" />
            <span>Infraestructura de Confianza y Automatización</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Emisión de Certificados Digitales y{' '}
            <span className="bg-gradient-to-r from-[#00668c] via-[#008ba8] to-[#00b8b8] bg-clip-text text-transparent">
              Hardware de Criptografía
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Garantizamos la seguridad de tu identidad digital con certificados oficiales para SUNAT y firmas electrónicas, complementados con lectores de DNIe y tokens criptográficos de alta durabilidad.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#00668c] to-[#008ba8] hover:from-[#005270] hover:to-[#00738a] text-white text-sm font-bold shadow-lg shadow-[#00668c]/25 transition-all flex items-center justify-center gap-2"
            >
              <span>Ingresar a Hyperion Auto Cert</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#productos"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold border border-slate-300 shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>Explorar Hardware</span>
            </a>
          </div>
        </div>
      </section>

      {/* ==================== CARRUSEL LIMPIO DE PRODUCTOS ==================== */}
      <section id="productos" className="py-16 bg-white border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header con flechas de navegación */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#00b8b8]">Nuestros Productos</h2>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Hardware Criptográfico y Lectores de DNIe
              </p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Haz clic en cualquier producto para conocer sus características técnicas y utilidad recomendada.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors shadow-sm active:scale-95"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors shadow-sm active:scale-95"
                aria-label="Siguiente"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Contenedor del Carrusel Horizontal */}
          <div
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {hardwareProducts.map((prod) => (
              <div
                key={prod.id}
                onClick={() => setSelectedProduct(prod)}
                className="snap-start flex-shrink-0 w-72 sm:w-80 bg-slate-50/80 hover:bg-white rounded-3xl border border-slate-200/90 hover:border-[#00668c]/40 hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between p-6"
              >
                {/* Imagen del Producto */}
                <div className="relative w-full h-56 flex items-center justify-center bg-white rounded-2xl p-4 border border-slate-100 group-hover:border-teal-100 transition-colors">
                  <div className="relative w-44 h-44">
                    <Image
                      src={prod.image}
                      alt={prod.name}
                      fill
                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </div>

                {/* Título y botón */}
                <div className="pt-5 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#00668c] block">
                      {prod.badge}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#00668c] transition-colors leading-snug mt-1">
                      {prod.name}
                    </h3>
                  </div>

                  <div className="pt-2">
                    <span className="w-full py-2.5 px-4 rounded-xl bg-white group-hover:bg-[#00668c] text-slate-700 group-hover:text-white border border-slate-200 group-hover:border-transparent text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm">
                      <Info className="w-4 h-4" />
                      <span>Ver Detalle y Utilidad</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== MODAL DE DETALLE DEL PRODUCTO ==================== */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            {/* Header del Modal */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-teal-50 text-[#00668c] border border-teal-200">
                {selectedProduct.badge}
              </span>
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-48 h-48 flex-shrink-0 bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-center">
                  <div className="relative w-40 h-40">
                    <Image
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                <div className="space-y-2 text-center sm:text-left">
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#00668c]">
                    {selectedProduct.subtitle}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {selectedProduct.desc}
                  </p>
                </div>
              </div>

              {/* Utilidad */}
              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-100 space-y-1">
                <span className="text-xs font-bold text-[#00668c] block uppercase tracking-wide">
                  ¿Para qué sirve y cuál es su utilidad?
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedProduct.utility}
                </p>
              </div>

              {/* Especificaciones */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                  Especificaciones Técnicas
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedProduct.specs.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                Cerrar
              </button>

              <a
                href="https://hyperion.com.pe/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#00668c] hover:bg-[#005270] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Cotizar en hyperion.com.pe</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SERVICIOS DE IDENTIDAD ==================== */}
      <section id="servicios" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#00668c]">Servicios de Confianza</h2>
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              Emisión de Certificados Digitales
            </p>
            <p className="text-xs sm:text-sm text-slate-500">
              Certificados con respaldo normativo nacional e internacional para todas tus necesidades tributarias y jurídicas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-teal-100/60 text-[#00668c] flex items-center justify-center font-bold">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Persona Natural y Jurídica</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Emisión de certificados digitales para personas naturales, apoderados legales y empresas para comprobantes de pago SUNAT, contratos y poderes.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-slate-500">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Válidos ante SUNAT, OSCE y PJ</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Exportables en formato P12 y PFX</li>
              </ul>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-teal-100/60 text-[#00668c] flex items-center justify-center font-bold">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Plataforma Auto Cert</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gestión automatizada de confirmación, interacción con entidades emisoras y captura segura de códigos de descarga en tiempo récord.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-slate-500">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Monitoreo y confirmación Playwright</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Cifrado AES-256 de claves</li>
              </ul>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-teal-100/60 text-[#00668c] flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Validación Biométrica BioCamer</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Autenticación dactilar y facial para garantizar que el solicitante sea el verdadero titular del DNI o carné de extranjería.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-slate-500">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Cero riesgo de suplantación</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Habilitación inmediata de descarga</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CÓMO FUNCIONA EL PROCESO ==================== */}
      <section id="automatizacion" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#00668c]">Flujo de Trabajo</h2>
            <p className="text-3xl font-black text-slate-900 tracking-tight">
              ¿Cómo opera Hyperion Auto Cert?
            </p>
            <p className="text-xs sm:text-sm text-slate-500">
              Proceso de 4 pasos optimizado para que obtengas tu certificado sin demoras burocráticas ni complicaciones técnicas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="w-8 h-8 rounded-lg bg-[#00668c] text-white flex items-center justify-center font-bold text-xs">
                01
              </span>
              <h4 className="font-bold text-sm text-slate-900">Carga de Documentos</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sube tu DNI o documentación corporativa. El sistema con IA extrae y valida los datos automáticamente.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="w-8 h-8 rounded-lg bg-[#00668c] text-white flex items-center justify-center font-bold text-xs">
                02
              </span>
              <h4 className="font-bold text-sm text-slate-900">Validación Biométrica</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Confirmación facial o dactilar en BioCamer para verificar la identidad legal del titular.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="w-8 h-8 rounded-lg bg-[#00668c] text-white flex items-center justify-center font-bold text-xs">
                03
              </span>
              <h4 className="font-bold text-sm text-slate-900">Autogestión Web</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                El backend procesa la solicitud, completa la interacción en Camerfirma y cifra el código de descarga.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="w-8 h-8 rounded-lg bg-[#00b8b8] text-white flex items-center justify-center font-bold text-xs">
                04
              </span>
              <h4 className="font-bold text-sm text-slate-900">Descarga y Resguardo</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Acceso con un clic a la página oficial de descarga o instalación directa en tu Token Criptográfico.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== QUIÉNES SOMOS ==================== */}
      <section id="nosotros" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#00668c]">Sobre Hyperion</h2>
              <p className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Líderes en Soluciones de Seguridad Digital e Identidad Electrónica
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                En <strong>Hyperion Digital Security</strong> desarrollamos infraestructura tecnológica y suministramos dispositivos para garantizar certeza jurídica en el entorno digital. Reducimos los tiempos de tramitación de certificados y facilitamos su resguardo en hardware especializado.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1 shadow-sm">
                  <Award className="w-5 h-5 text-[#00668c]" />
                  <h4 className="text-xs font-bold text-slate-800">Cumplimiento Legal</h4>
                  <p className="text-[11px] text-slate-500">Validez idéntica a la firma manuscrita según la Ley N° 27269.</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1 shadow-sm">
                  <Users className="w-5 h-5 text-[#00668c]" />
                  <h4 className="text-xs font-bold text-slate-800">Soporte Continuo</h4>
                  <p className="text-[11px] text-slate-500">Asesoría directa en instalación, configuración y resguardo.</p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#00668c]" />
                Preguntas Frecuentes
              </h3>

              <div className="space-y-4 text-xs divide-y divide-slate-100">
                <div className="pt-2">
                  <h5 className="font-bold text-slate-800">¿Para qué sirve el certificado digital?</h5>
                  <p className="text-slate-500 mt-1">Permite firmar documentos digitales con la misma validez que la firma manuscrita, emitir comprobantes de pago electrónicos y autenticarse en portales oficiales.</p>
                </div>

                <div className="pt-4">
                  <h5 className="font-bold text-slate-800">¿Por qué es indispensable un Token USB Criptográfico?</h5>
                  <p className="text-slate-500 mt-1">El token asegura que la clave privada nunca pueda ser extraída ni clonada del dispositivo, cumpliendo las exigencias de seguridad y evitando fraudes.</p>
                </div>

                <div className="pt-4">
                  <h5 className="font-bold text-slate-800">¿Qué tipo de documentos leen los dispositivos Hyperion?</h5>
                  <p className="text-slate-500 mt-1">Todos nuestros lectores son 100% compatibles con DNI electrónico peruano (versiones 3.0 y 4.0), así como con tarjetas inteligentes bajo estándar ISO 7816.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer id="contacto" className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 text-xs">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 flex-shrink-0">
                <Image
                  src="/logo-hyperion.png"
                  alt="Hyperion"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-white font-black text-sm">HYPERION DIGITAL SECURITY</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Infraestructura y emisión de certificados digitales, software de automatización y hardware de custodia criptográfica.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">Hardware Destacado</h4>
            <ul className="space-y-2 text-slate-400">
              <li>Token Criptográfico USB FIPS 140-2</li>
              <li>Lector DNIe Vertical Desktop</li>
              <li>Lector CardMaster Pro Multi-Ranura</li>
              <li>IntelliReader y Mini Lector USB</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">Contacto Corporativo</h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#00b8b8]" /> contacto@hyperion.com.pe</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-[#00b8b8]" /> +51 923 848 984</li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#00b8b8]" /> Ica / Lima, Perú</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3">Portal Auto Cert</h4>
            <p className="text-slate-500 mb-3">Ingresa al sistema para tramitar, validar y descargar certificados digitales.</p>
            <Link
              href="/login"
              className="inline-block px-4 py-2 rounded-lg bg-[#00668c] hover:bg-[#005270] text-white font-bold transition-colors shadow-sm"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-slate-800 text-center text-slate-600 text-[11px]">
          © {new Date().getFullYear()} Hyperion Digital Security S.A.C. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}