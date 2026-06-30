import { describe, it, expect } from 'vitest';
import {
  ContentSchema,
  defaultContent,
  getActiveChicas,
  getChicaBySlug,
  tLocalized,
  whatsappUrl,
  chicaWhatsappMessage,
  formatCop,
  ui,
} from './index.js';

describe('ContentSchema', () => {
  it('valida el contenido por defecto', () => {
    expect(() => ContentSchema.parse(defaultContent)).not.toThrow();
  });

  it('añade apariencia por defecto en JSON antiguo', () => {
    const { apariencia: _, ...legacy } = defaultContent;
    const parsed = ContentSchema.parse(legacy);
    expect(parsed.apariencia.fondo).toBe('');
  });

  it('rechaza slug inválido', () => {
    const bad = structuredClone(defaultContent);
    bad.chicas[0].slug = 'Sofia Invalid';
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
