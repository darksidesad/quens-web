import { describe, it, expect } from 'vitest';
import {
  ContentSchema,
  defaultContent,
  getActiveChicas,
  getActiveEventos,
  getChicaBySlug,
  getEventoBySlug,
  tLocalized,
  whatsappUrl,
  chicaWhatsappMessage,
  formatCop,
  ui,
  formatEventDate,
} from './index.js';

describe('ContentSchema', () => {
  it('valida el contenido por defecto', () => {
    expect(() => ContentSchema.parse(defaultContent)).not.toThrow();
  });

  it('añade apariencia por defecto en JSON antiguo', () => {
    const { apariencia: _, ...legacy } = defaultContent;
    const parsed = ContentSchema.parse(legacy);
    expect(parsed.apariencia.fondo).toBe('');
    expect(parsed.apariencia.fondoMovil.size).toBe('cover');
    expect(parsed.apariencia.fondoMovil.opacity).toBe(0.35);
  });

  it('añade eventos como array vacío en JSON antiguo', () => {
    const { eventos: _, ...legacy } = defaultContent as unknown as { eventos: unknown };
    const parsed = ContentSchema.parse(legacy) as typeof defaultContent;
    expect(parsed.eventos).toEqual([]);
  });

  it('rechaza slug inválido', () => {
    const bad = structuredClone(defaultContent);
    bad.chicas[0].slug = 'Sofia Invalid';
    expect(() => ContentSchema.parse(bad)).toThrow();
  });

  it('rechaza evento con fecha con formato inválido', () => {
    const bad = structuredClone(defaultContent);
    bad.eventos[0].fecha = '31-12-2099';
    expect(() => ContentSchema.parse(bad)).toThrow();
  });
});

describe('getActiveChicas', () => {
  it('filtra inactivas y ordena por orden', () => {
    const content = structuredClone(defaultContent);
    content.chicas.push({
      ...content.chicas[0],
      id: 'e5f6a7b8-c9d0-1234-efab-345678901234',
      slug: 'inactiva',
      activa: false,
      orden: -1,
    });
    const active = getActiveChicas(content);
    expect(active).toHaveLength(2);
    expect(active[0].slug).toBe('sofia');
    expect(active.every((c) => c.activa)).toBe(true);
  });
});

describe('getChicaBySlug', () => {
  it('encuentra chica activa', () => {
    expect(getChicaBySlug(defaultContent, 'sofia')?.nombre.es).toBe('Sofía');
  });

  it('no encuentra chica inactiva', () => {
    const content = structuredClone(defaultContent);
    content.chicas[0].activa = false;
    expect(getChicaBySlug(content, 'sofia')).toBeUndefined();
  });
});

describe('i18n helpers', () => {
  it('tLocalized devuelve idioma correcto', () => {
    expect(tLocalized({ es: 'Hola', en: 'Hello' }, 'en')).toBe('Hello');
  });

  it('ui devuelve strings de navegación', () => {
    expect(ui('navHome', 'es')).toBe('Inicio');
    expect(ui('navHome', 'en')).toBe('Home');
  });

  it('formatCop formatea pesos', () => {
    expect(formatCop(120000, 'es')).toContain('120');
  });
});

describe('whatsapp', () => {
  it('genera URL con mensaje de cita', () => {
    const msg = chicaWhatsappMessage('Sofía');
    expect(msg).toBe('Hola, me interesa una cita con Sofía');
    const url = whatsappUrl('+573001234567', msg);
    expect(url).toContain('wa.me/573001234567');
    expect(url).toContain(encodeURIComponent(msg));
  });
});

describe('eventos', () => {
  it('getActiveEventos filtra inactivos y ordena destacados primero', () => {
    const content = structuredClone(defaultContent);
    content.eventos = [
      { ...content.eventos[0], id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', slug: 'uno', activo: true, fecha: '2099-01-01', destacado: false, orden: 1 },
      { ...content.eventos[0], id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', slug: 'dos', activo: false, fecha: '2099-01-02', destacado: true, orden: 0 },
      { ...content.eventos[0], id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', slug: 'tres', activo: true, fecha: '2099-02-01', destacado: true, orden: 0 },
    ];
    const active = getActiveEventos(content);
    expect(active).toHaveLength(2);
    expect(active[0].slug).toBe('tres');
    expect(active.every((e) => e.activo)).toBe(true);
  });

  it('getActiveEventos con onlyUpcoming respeta la fecha actual', () => {
    const content = structuredClone(defaultContent);
    const fakeNow = new Date('2099-06-15T12:00:00Z');
    const upcoming = getActiveEventos(content, { onlyUpcoming: true, now: fakeNow });
    expect(upcoming.every((e) => e.fecha >= '2099-06-15')).toBe(true);
  });

  it('getEventoBySlug solo devuelve eventos activos', () => {
    expect(getEventoBySlug(defaultContent, 'noche-de-piedras-calientes')?.slug).toBe('noche-de-piedras-calientes');
    const content = structuredClone(defaultContent);
    content.eventos[0].activo = false;
    expect(getEventoBySlug(content, 'noche-de-piedras-calientes')).toBeUndefined();
  });

  it('formatEventDate produce texto legible en ES y EN', () => {
    const es = formatEventDate('2099-12-31', 'es');
    const en = formatEventDate('2099-12-31', 'en');
    expect(es).toMatch(/diciembre/);
    expect(en).toMatch(/December/);
  });

  it('UI_STRINGS incluye text de eventos en ambos idiomas', () => {
    expect(ui('navEvents', 'es')).toBe('Eventos');
    expect(ui('navEvents', 'en')).toBe('Events');
    expect(ui('upcomingEvents', 'es')).toBe('Próximos eventos');
    expect(ui('upcomingEvents', 'en')).toBe('Upcoming events');
  });
});
