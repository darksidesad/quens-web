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
  },
  en: {
    navHome: 'Home',
    navServices: 'Services',
    navTeam: 'Team',
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

export const defaultContent: Content = {
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
};
