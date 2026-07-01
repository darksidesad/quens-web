import { z } from 'zod';

export const LocalizedStringSchema = z.object({
  es: z.string(),
  en: z.string(),
});

export type LocalizedString = z.infer<typeof LocalizedStringSchema>;

export const DiaSchema = z.enum(['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom']);
export type Dia = z.infer<typeof DiaSchema>;

export const HorarioDiaSchema = z.object({
  inicio: z.string().regex(/^\d{2}:\d{2}$/),
  fin: z.string().regex(/^\d{2}:\d{2}$/),
});

export const ServicioSchema = z.object({
  id: z.string().uuid(),
  nombre: LocalizedStringSchema,
  descripcion: LocalizedStringSchema,
  precio: z.number().int().nonnegative(),
  duracion: z.string().min(1),
  imagen: z.string().default(''),
  orden: z.number().int(),
});

export type Servicio = z.infer<typeof ServicioSchema>;

/** Estilo de fondo del sitio en móvil. */
export const FondoMovilSizeSchema = z.enum(['cover', 'contain', 'auto']);
export type FondoMovilSize = z.infer<typeof FondoMovilSizeSchema>;

export const FondoMovilPositionSchema = z.enum([
  'center',
  'top',
  'bottom',
  'left',
  'right',
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
]);
export type FondoMovilPosition = z.infer<typeof FondoMovilPositionSchema>;

export const AparienciaSchema = z.object({
  fondo: z.string().default(''),
  fondoMovil: z.object({
    size: FondoMovilSizeSchema.default('cover'),
    position: FondoMovilPositionSchema.default('center'),
    repeat: z.boolean().default(false),
    opacity: z.number().min(0).max(1).default(0.35),
  }).default({ size: 'cover', position: 'center', repeat: false, opacity: 0.35 }),
});
export type Apariencia = z.infer<typeof AparienciaSchema>;

export const EventoSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  titulo: LocalizedStringSchema,
  descripcion: LocalizedStringSchema,
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hora: z.string().optional().default(''),
  lugar: z.string().default(''),
  imagen: z.string().default(''),
  enlace: z.string().default(''),
  activo: z.boolean(),
  destacado: z.boolean().default(false),
  orden: z.number().int(),
});
export type Evento = z.infer<typeof EventoSchema>;

export const ChicaSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  nombre: LocalizedStringSchema,
  descripcion: LocalizedStringSchema,
  fotos: z.array(z.string()),
  servicios: z.array(z.string().uuid()),
  dias: z.array(DiaSchema),
  horarios: z.record(DiaSchema, HorarioDiaSchema).default({}),
  activa: z.boolean(),
  orden: z.number().int(),
});

export type Chica = z.infer<typeof ChicaSchema>;

export const ContentSchema = z.object({
  apariencia: AparienciaSchema.default({
    fondo: '',
    fondoMovil: { size: 'cover', position: 'center', repeat: false, opacity: 0.35 },
  }),
  home: z.object({
    hero: z.object({
      titulo: LocalizedStringSchema,
      subtitulo: LocalizedStringSchema,
      imagen: z.string().default(''),
    }),
  }),
  contacto: z.object({
    whatsapp: z.string().min(8),
    direccion: LocalizedStringSchema,
    mapa: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
    horarios: LocalizedStringSchema,
    instagram: z.string().default(''),
  }),
  servicios: z.array(ServicioSchema),
  chicas: z.array(ChicaSchema),
  eventos: z.array(EventoSchema).default([]),
});

export type Content = z.infer<typeof ContentSchema>;

export type Lang = 'es' | 'en';

export function tLocalized(value: LocalizedString, lang: Lang): string {
  return value[lang] || value.es;
}

export function formatCop(amount: number, lang: Lang): string {
  return new Intl.NumberFormat(lang === 'es' ? 'es-CO' : 'en-US', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function whatsappUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function chicaWhatsappMessage(nombre: string): string {
  return `Hola, me interesa una cita con ${nombre}`;
}

export const DIA_LABELS: Record<Dia, { es: string; en: string }> = {
  lun: { es: 'Lunes', en: 'Monday' },
  mar: { es: 'Martes', en: 'Tuesday' },
  mie: { es: 'Miércoles', en: 'Wednesday' },
  jue: { es: 'Jueves', en: 'Thursday' },
  vie: { es: 'Viernes', en: 'Friday' },
  sab: { es: 'Sábado', en: 'Saturday' },
  dom: { es: 'Domingo', en: 'Sunday' },
};

export const UI_STRINGS = {
  es: {
    navHome: 'Inicio',
    navServices: 'Servicios',
    navTeam: 'Chicas',
    navEvents: 'Eventos',
    book: 'Reservar',
    viewProfile: 'Ver perfil',
    ourServices: 'Nuestros servicios',
    ourTeam: 'Nuestro equipo',
    location: 'Ubicación',
    hours: 'Horarios',
    schedule: 'Disponibilidad',
    specialties: 'Servicios',
    contactWhatsapp: 'Contactar por WhatsApp',
    notFound: 'Página no encontrada',
    backHome: 'Volver al inicio',
    duration: 'Duración',
    price: 'Precio',
    allServices: 'Todos los servicios',
    meetTeam: 'Conoce a nuestro equipo',
    upcomingEvents: 'Próximos eventos',
    pastEvents: 'Eventos pasados',
    noEvents: 'No hay eventos programados por ahora.',
    eventDate: 'Fecha',
    eventLocation: 'Lugar',
    eventTime: 'Hora',
    eventMoreInfo: 'Más información',
  },
  en: {
    navHome: 'Home',
    navServices: 'Services',
    navTeam: 'Team',
    navEvents: 'Events',
    book: 'Book now',
    viewProfile: 'View profile',
    ourServices: 'Our services',
    ourTeam: 'Our team',
    location: 'Location',
    hours: 'Hours',
    schedule: 'Availability',
    specialties: 'Services',
    contactWhatsapp: 'Contact via WhatsApp',
    notFound: 'Page not found',
    backHome: 'Back to home',
    duration: 'Duration',
    price: 'Price',
    allServices: 'All services',
    meetTeam: 'Meet our team',
    upcomingEvents: 'Upcoming events',
    pastEvents: 'Past events',
    noEvents: 'No events scheduled at the moment.',
    eventDate: 'Date',
    eventLocation: 'Location',
    eventTime: 'Time',
    eventMoreInfo: 'More information',
  },
} as const;

export type UiKey = keyof (typeof UI_STRINGS)['es'];

export function ui(key: UiKey, lang: Lang): string {
  return UI_STRINGS[lang][key];
}

export function getActiveChicas(content: Content): Chica[] {
  return [...content.chicas]
    .filter((c) => c.activa)
    .sort((a, b) => a.orden - b.orden);
}

export function getChicaBySlug(content: Content, slug: string): Chica | undefined {
  return content.chicas.find((c) => c.slug === slug && c.activa);
}

export function getSortedServicios(content: Content): Servicio[] {
  return [...content.servicios].sort((a, b) => a.orden - b.orden);
}

/** Devuelve los eventos activos ordenados (próximos primero según la fecha actual). */
export function getActiveEventos(
  content: Content,
  options: { onlyUpcoming?: boolean; now?: Date } = {},
): Evento[] {
  const now = options.now ?? new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return [...(content.eventos ?? [])]
    .filter((e) => e.activo)
    .filter((e) => (options.onlyUpcoming ? e.fecha >= today : true))
    .sort((a, b) => {
      if (a.destacado !== b.destacado) return a.destacado ? -1 : 1;
      return a.fecha === b.fecha ? a.orden - b.orden : a.fecha.localeCompare(b.fecha);
    });
}

export function getActiveEventosOrden(content: Content): Evento[] {
  return getActiveEventos(content).sort((a, b) => a.orden - b.orden);
}

export function getEventoBySlug(content: Content, slug: string): Evento | undefined {
  return (content.eventos ?? []).find((e) => e.slug === slug && e.activo);
}

/** Formato corto para fecha 'YYYY-MM-DD' en es/en. */
export function formatEventDate(iso: string, lang: Lang): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-CO' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export const defaultContent: Content = {
  apariencia: {
    fondo: '',
    fondoMovil: {
      size: 'cover',
      position: 'center',
      repeat: false,
      opacity: 0.35,
    },
  },
  home: {
    hero: {
      titulo: { es: 'Quenns Spa', en: 'Quenns Spa' },
      subtitulo: {
        es: 'Tu momento de lujo y bienestar',
        en: 'Your moment of luxury and wellness',
      },
      imagen: '',
    },
  },
  contacto: {
    whatsapp: '+573001234567',
    direccion: {
      es: 'Calle 123 #45-67, Bogotá',
      en: '123 Street #45-67, Bogota',
    },
    mapa: { lat: 4.711, lng: -74.0721 },
    horarios: {
      es: 'Lun – Sáb: 10:00 – 20:00',
      en: 'Mon – Sat: 10:00 AM – 8:00 PM',
    },
    instagram: '',
  },
  servicios: [
    {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      nombre: { es: 'Masaje Relajante', en: 'Relaxing Massage' },
      descripcion: {
        es: 'Masaje corporal completo para aliviar tensiones.',
        en: 'Full body massage to relieve tension.',
      },
      precio: 120000,
      duracion: '60 min',
      imagen: '',
      orden: 0,
    },
    {
      id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
      nombre: { es: 'Masaje con Piedras Calientes', en: 'Hot Stone Massage' },
      descripcion: {
        es: 'Terapia con piedras volcánicas calientes.',
        en: 'Therapy with heated volcanic stones.',
      },
      precio: 150000,
      duracion: '75 min',
      imagen: '',
      orden: 1,
    },
  ],
  chicas: [
    {
      id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
      slug: 'sofia',
      nombre: { es: 'Sofía', en: 'Sofia' },
      descripcion: {
        es: 'Especialista en masajes relajantes y aromaterapia.',
        en: 'Specialist in relaxing massages and aromatherapy.',
      },
      fotos: [],
      servicios: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
      dias: ['lun', 'mar', 'mie', 'jue', 'vie'],
      horarios: {
        lun: { inicio: '10:00', fin: '18:00' },
        mar: { inicio: '10:00', fin: '18:00' },
        mie: { inicio: '12:00', fin: '20:00' },
        jue: { inicio: '10:00', fin: '18:00' },
        vie: { inicio: '10:00', fin: '18:00' },
      },
      activa: true,
      orden: 0,
    },
    {
      id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
      slug: 'valentina',
      nombre: { es: 'Valentina', en: 'Valentina' },
      descripcion: {
        es: 'Experta en técnicas de piedras calientes.',
        en: 'Expert in hot stone techniques.',
      },
      fotos: [],
      servicios: ['b2c3d4e5-f6a7-8901-bcde-f12345678901'],
      dias: ['mar', 'jue', 'sab'],
      horarios: {
        mar: { inicio: '11:00', fin: '19:00' },
        jue: { inicio: '11:00', fin: '19:00' },
        sab: { inicio: '10:00', fin: '16:00' },
      },
      activa: true,
      orden: 1,
    },
  ],
  eventos: [
    {
      id: 'e1f2a3b4-c5d6-7890-efab-345678901234',
      slug: 'noche-de-piedras-calientes',
      titulo: {
        es: 'Noche de Piedras Calientes',
        en: 'Hot Stone Night',
      },
      descripcion: {
        es: 'Una velada especial con descuento del 20% en masajes con piedras volcánicas. Cupos limitados.',
        en: 'A special evening with 20% off hot stone massages. Limited spots.',
      },
      fecha: '2099-12-31',
      hora: '19:00',
      lugar: 'Quenns Spa',
      imagen: '',
      enlace: '',
      activo: true,
      destacado: true,
      orden: 0,
    },
  ],
};
