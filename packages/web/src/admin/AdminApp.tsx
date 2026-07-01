import { useState, useEffect, useCallback, useRef } from 'react';
import type { Content, Chica, Servicio, Dia, Evento, Apariencia } from '@quenns/shared';
import { DIA_LABELS } from '@quenns/shared';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { fetchContent, login, saveContent, uploadFile, getToken, setToken } from '../lib/api';
import { prepareImageForUpload } from '../lib/imageUpload';
import { AdminButton } from './AdminButton';
import { AdminToast } from './AdminToast';

type Tab = 'dashboard' | 'chicas' | 'servicios' | 'home' | 'eventos' | 'contacto';

const DIAS: Dia[] = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];

function uuid(): string {
  return crypto.randomUUID();
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function SortableChicaRow({
  chica,
  selected,
  onSelect,
}: {
  chica: Chica;
  selected: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: chica.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 p-3 border rounded cursor-pointer ${selected ? 'border-gold bg-gold/10' : 'border-border bg-surface'}`}
      onClick={onSelect}
    >
      <button type="button" className="cursor-grab text-muted px-1" {...attributes} {...listeners} onClick={(e) => e.stopPropagation()}>
        ⠿
      </button>
      <span className={`w-2 h-2 rounded-full ${chica.activa ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className="flex-1 text-sm">{chica.nombre.es}</span>
      <span className="text-xs text-muted">#{chica.orden}</span>
    </div>
  );
}

function LocalizedInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: { es: string; en: string };
  onChange: (v: { es: string; en: string }) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-gold uppercase tracking-widest">{label}</label>
      <input
        className="w-full bg-bg border border-border rounded px-3 py-2 text-sm"
        placeholder="Español"
        value={value.es}
        onChange={(e) => onChange({ ...value, es: e.target.value })}
      />
      <input
        className="w-full bg-bg border border-border rounded px-3 py-2 text-sm"
        placeholder="English"
        value={value.en}
        onChange={(e) => onChange({ ...value, en: e.target.value })}
      />
    </div>
  );
}

export default function AdminApp() {
  const [token, setTokenState] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [content, setContent] = useState<Content | null>(null);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [selectedChicaId, setSelectedChicaId] = useState<string | null>(null);
  const [selectedServicioId, setSelectedServicioId] = useState<string | null>(null);
  const [selectedEventoId, setSelectedEventoId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [message, setMessage] = useState('');
  const [saveFlash, setSaveFlash] = useState(false);
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef<Content | null>(null);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  const showMessage = useCallback((text: string, ms = 2500) => {
    if (messageTimer.current) clearTimeout(messageTimer.current);
    setMessage(text);
    messageTimer.current = setTimeout(() => setMessage(''), ms);
  }, []);

  const persist = useCallback(async (updated: Content): Promise<boolean> => {
    if (!token) return false;
    setSaving(true);
    setSaveFlash(false);
    setMessage('');
    const started = Date.now();
    const normalized: Content = {
      ...updated,
      apariencia: updated.apariencia ?? { fondo: '', fondoMovil: { size: 'cover', position: 'center', repeat: false, opacity: 0.35 } },
      eventos: updated.eventos ?? [],
    };
    try {
      const saved = await saveContent(normalized, token);
      setContent(saved);
      const wait = Math.max(0, 550 - (Date.now() - started));
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      setSaveFlash(true);
      showMessage('Guardado correctamente');
      setTimeout(() => setSaveFlash(false), 1200);
      return true;
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Error al guardar');
      return false;
    } finally {
      setSaving(false);
    }
  }, [token, showMessage]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    const t = getToken();
    if (t) setTokenState(t);
  }, []);

  const load = useCallback(async () => {
    const data = await fetchContent();
    setContent(data);
  }, []);

  useEffect(() => {
    if (token) load().catch(() => setToken(null));
  }, [token, load]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    try {
      const t = await login(password);
      setTokenState(t);
    } catch {
      setLoginError('Contraseña incorrecta');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleUpload = async (file: File, applyUrl: (url: string) => Content) => {
    if (!token || !contentRef.current) return;
    setUploading(true);
    setMessage('');
    try {
      const prepared = await prepareImageForUpload(file);
      const url = await uploadFile(prepared, token);
      await persist(applyUrl(url));
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Error al subir imagen');
    } finally {
      setUploading(false);
    }
  };

  const appendChicaFotos = async (chicaId: string, files: File[]) => {
    if (!token) {
      showMessage('Sesión expirada. Vuelve a entrar al admin.');
      return;
    }
    if (files.length === 0) return;
    setUploading(true);
    setMessage('');
    try {
      const urls: string[] = [];
      for (const raw of files) {
        const prepared = await prepareImageForUpload(raw);
        urls.push(await uploadFile(prepared, token));
      }
      const current = contentRef.current;
      if (!current) throw new Error('Contenido no cargado');
      const target = current.chicas.find((c) => c.id === chicaId);
      if (!target) throw new Error('Chica no encontrada. Selecciónala de nuevo.');
      const updated: Content = {
        ...current,
        apariencia: current.apariencia ?? { fondo: '' },
        chicas: current.chicas.map((c) =>
          c.id === chicaId ? { ...c, fotos: [...c.fotos, ...urls] } : c,
        ),
      };
      const ok = await persist(updated);
      if (!ok) throw new Error('No se pudo guardar las fotos');
    } catch (err) {
      showMessage(err instanceof Error ? err.message : 'Error al subir imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setTokenState(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!content) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sorted = [...content.chicas].sort((a, b) => a.orden - b.orden);
    const oldIndex = sorted.findIndex((c) => c.id === active.id);
    const newIndex = sorted.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(sorted, oldIndex, newIndex).map((c, i) => ({ ...c, orden: i }));
    const ids = new Set(reordered.map((c) => c.id));
    const rest = content.chicas.filter((c) => !ids.has(c.id));
    persist({ ...content, chicas: [...reordered, ...rest] });
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg px-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-surface border border-border p-8 rounded-lg">
          <h1 className="text-2xl text-gold text-center mb-8 tracking-widest">QUENNS ADMIN</h1>
          <input
            type="password"
            className="w-full bg-bg border border-border rounded px-4 py-3 mb-4"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {loginError && <p className="text-red-400 text-sm mb-4">{loginError}</p>}
          <AdminButton type="submit" loading={loggingIn} className="w-full py-3">
            Entrar
          </AdminButton>
        </form>
      </div>
    );
  }

  if (!content) return <p className="text-center py-32 text-muted">Cargando panel...</p>;

  const sortedChicas = [...content.chicas].sort((a, b) => a.orden - b.orden);
  const selectedChica = sortedChicas.find((c) => c.id === selectedChicaId);
  const selectedServicio = content.servicios.find((s) => s.id === selectedServicioId);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'dashboard', label: 'Resumen' },
    { id: 'chicas', label: 'Chicas' },
    { id: 'servicios', label: 'Servicios' },
    { id: 'eventos', label: 'Eventos' },
    { id: 'home', label: 'Home' },
    { id: 'contacto', label: 'Contacto' },
  ];

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="border-b border-border bg-surface px-6 py-4 flex items-center justify-between">
        <h1 className="text-gold tracking-widest font-semibold">QUENNS ADMIN</h1>
        <div className="flex items-center gap-4">
          <button type="button" onClick={handleLogout} className="text-xs text-muted hover:text-gold">
            Salir
          </button>
        </div>
      </header>

      <nav className="flex gap-1 px-6 py-3 border-b border-border overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-xs tracking-widest uppercase whitespace-nowrap ${tab === t.id ? 'bg-gold text-bg' : 'text-muted hover:text-gold'}`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {tab === 'dashboard' && (
          <div className="grid sm:grid-cols-4 gap-6">
            <div className="bg-surface border border-border p-6 rounded-lg text-center">
              <p className="text-3xl text-gold">{content.chicas.filter((c) => c.activa).length}</p>
              <p className="text-sm text-muted mt-1">Chicas activas</p>
            </div>
            <div className="bg-surface border border-border p-6 rounded-lg text-center">
              <p className="text-3xl text-gold">{content.chicas.filter((c) => !c.activa).length}</p>
              <p className="text-sm text-muted mt-1">Chicas inactivas</p>
            </div>
            <div className="bg-surface border border-border p-6 rounded-lg text-center">
              <p className="text-3xl text-gold">{content.servicios.length}</p>
              <p className="text-sm text-muted mt-1">Servicios</p>
            </div>
            <div className="bg-surface border border-border p-6 rounded-lg text-center">
              <p className="text-3xl text-gold">{(content.eventos ?? []).filter((e) => e.activo).length}</p>
              <p className="text-sm text-muted mt-1">Eventos activos</p>
            </div>
          </div>
        )}

        {tab === 'chicas' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-gold">Lista (arrastra para ordenar)</h2>
                <button
                  type="button"
                  className="text-xs bg-gold text-bg px-3 py-1"
                  onClick={() => {
                    const nueva: Chica = {
                      id: uuid(),
                      slug: `nueva-${Date.now()}`,
                      nombre: { es: 'Nueva', en: 'New' },
                      descripcion: { es: '', en: '' },
                      fotos: [],
                      servicios: [],
                      dias: [],
                      horarios: {},
                      activa: false,
                      orden: content.chicas.length,
                    };
                    const updated = { ...content, chicas: [...content.chicas, nueva] };
                    setContent(updated);
                    setSelectedChicaId(nueva.id);
                    void persist(updated);
                  }}
                >
                  + Agregar
                </button>
              </div>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sortedChicas.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {sortedChicas.map((c) => (
                      <SortableChicaRow key={c.id} chica={c} selected={c.id === selectedChicaId} onSelect={() => setSelectedChicaId(c.id)} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            {selectedChica && (
              <div className="bg-surface border border-border p-6 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-gold">Editar chica</h3>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedChica.activa}
                      onChange={(e) => {
                        const updated = content.chicas.map((c) =>
                          c.id === selectedChica.id ? { ...c, activa: e.target.checked } : c,
                        );
                        persist({ ...content, chicas: updated });
                      }}
                    />
                    Activa
                  </label>
                </div>
                <LocalizedInput
                  label="Nombre"
                  value={selectedChica.nombre}
                  onChange={(nombre) => {
                    const updated = content.chicas.map((c) =>
                      c.id === selectedChica.id ? { ...c, nombre, slug: slugify(nombre.es) || c.slug } : c,
                    );
                    setContent({ ...content, chicas: updated });
                  }}
                />
                <div>
                  <label className="text-xs text-gold uppercase tracking-widest">Slug</label>
                  <input
                    className="w-full bg-bg border border-border rounded px-3 py-2 text-sm mt-1"
                    value={selectedChica.slug}
                    onChange={(e) => {
                      const updated = content.chicas.map((c) =>
                        c.id === selectedChica.id ? { ...c, slug: e.target.value } : c,
                      );
                      setContent({ ...content, chicas: updated });
                    }}
                  />
                </div>
                <LocalizedInput
                  label="Descripción"
                  value={selectedChica.descripcion}
                  onChange={(descripcion) => {
                    const updated = content.chicas.map((c) =>
                      c.id === selectedChica.id ? { ...c, descripcion } : c,
                    );
                    setContent({ ...content, chicas: updated });
                  }}
                />
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs text-gold uppercase tracking-widest">Galería de fotos</label>
                    <span className="text-xs text-muted">{selectedChica.fotos.length} foto(s)</span>
                  </div>
                  <p className="text-xs text-muted mt-1 mb-2">Toca el botón dorado para elegir una o varias fotos.</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedChica.fotos.map((f, i) => (
                      <div key={`${f}-${i}`} className="relative">
                        <img src={f} alt="" className="w-24 h-24 object-cover rounded border border-border" />
                        <button
                          type="button"
                          className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full"
                          onClick={() => {
                            const fotos = selectedChica.fotos.filter((_, j) => j !== i);
                            const updated = content.chicas.map((c) => (c.id === selectedChica.id ? { ...c, fotos } : c));
                            void persist({ ...content, chicas: updated });
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploading || saving}
                    className="mt-3 block w-full text-sm text-muted file:mr-4 file:cursor-pointer file:rounded file:border-0 file:bg-gold file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-widest file:text-bg hover:file:bg-gold-light disabled:opacity-50"
                    onChange={(e) => {
                      const input = e.currentTarget;
                      const picked = input.files ? Array.from(input.files) : [];
                      const chicaId = selectedChica.id;
                      if (!picked.length) return;
                      void appendChicaFotos(chicaId, picked).finally(() => {
                        input.value = '';
                      });
                    }}
                  />
                  {uploading && <p className="text-xs text-gold mt-2 animate-pulse">Subiendo imagen...</p>}
                </div>
                <div>
                  <label className="text-xs text-gold uppercase tracking-widest">Servicios</label>
                  <div className="space-y-1 mt-2">
                    {content.servicios.map((s) => (
                      <label key={s.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedChica.servicios.includes(s.id)}
                          onChange={(e) => {
                            const servicios = e.target.checked
                              ? [...selectedChica.servicios, s.id]
                              : selectedChica.servicios.filter((id) => id !== s.id);
                            const updated = content.chicas.map((c) =>
                              c.id === selectedChica.id ? { ...c, servicios } : c,
                            );
                            setContent({ ...content, chicas: updated });
                          }}
                        />
                        {s.nombre.es}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gold uppercase tracking-widest">Días y horarios</label>
                  <div className="space-y-2 mt-2">
                    {DIAS.map((d) => {
                      const active = selectedChica.dias.includes(d);
                      const h = selectedChica.horarios[d] || { inicio: '10:00', fin: '18:00' };
                      return (
                        <div key={d} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={active}
                            onChange={(e) => {
                              let dias = e.target.checked
                                ? [...selectedChica.dias, d]
                                : selectedChica.dias.filter((x) => x !== d);
                              const horarios = { ...selectedChica.horarios };
                              if (e.target.checked) horarios[d] = h;
                              else delete horarios[d];
                              const updated = content.chicas.map((c) =>
                                c.id === selectedChica.id ? { ...c, dias, horarios } : c,
                              );
                              setContent({ ...content, chicas: updated });
                            }}
                          />
                          <span className="w-24">{DIA_LABELS[d].es}</span>
                          {active && (
                            <>
                              <input
                                type="time"
                                className="bg-bg border border-border rounded px-2 py-1"
                                value={h.inicio}
                                onChange={(e) => {
                                  const horarios = { ...selectedChica.horarios, [d]: { ...h, inicio: e.target.value } };
                                  const updated = content.chicas.map((c) =>
                                    c.id === selectedChica.id ? { ...c, horarios } : c,
                                  );
                                  setContent({ ...content, chicas: updated });
                                }}
                              />
                              <span>–</span>
                              <input
                                type="time"
                                className="bg-bg border border-border rounded px-2 py-1"
                                value={h.fin}
                                onChange={(e) => {
                                  const horarios = { ...selectedChica.horarios, [d]: { ...h, fin: e.target.value } };
                                  const updated = content.chicas.map((c) =>
                                    c.id === selectedChica.id ? { ...c, horarios } : c,
                                  );
                                  setContent({ ...content, chicas: updated });
                                }}
                              />
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <AdminButton loading={saving} success={saveFlash} className="flex-1" onClick={() => persist(content)}>
                    Guardar
                  </AdminButton>
                  <a
                    href={`/chicas/${selectedChica.slug}`}
                    target="_blank"
                    rel="noopener"
                    className="px-4 py-2 border border-gold text-gold text-xs"
                  >
                    Vista previa
                  </a>
                  <AdminButton
                    variant="danger"
                    loading={saving}
                    onClick={() => {
                      if (!confirm('¿Eliminar esta chica?')) return;
                      persist({ ...content, chicas: content.chicas.filter((c) => c.id !== selectedChica.id) });
                      setSelectedChicaId(null);
                    }}
                  >
                    Eliminar
                  </AdminButton>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'servicios' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <div className="flex justify-between mb-4">
                <h2 className="text-gold">Servicios</h2>
                <button
                  type="button"
                  className="text-xs bg-gold text-bg px-3 py-1"
                  onClick={() => {
                    const nuevo: Servicio = {
                      id: uuid(),
                      nombre: { es: 'Nuevo servicio', en: 'New service' },
                      descripcion: { es: '', en: '' },
                      precio: 0,
                      duracion: '60 min',
                      imagen: '',
                      orden: content.servicios.length,
                    };
                    persist({ ...content, servicios: [...content.servicios, nuevo] });
                    setSelectedServicioId(nuevo.id);
                  }}
                >
                  + Agregar
                </button>
              </div>
              <div className="space-y-2">
                {content.servicios.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedServicioId(s.id)}
                    className={`w-full text-left p-3 border rounded text-sm ${selectedServicioId === s.id ? 'border-gold bg-gold/10' : 'border-border'}`}
                  >
                    {s.nombre.es} — ${s.precio.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
            {selectedServicio && (
              <div className="bg-surface border border-border p-6 rounded-lg space-y-4">
                <LocalizedInput
                  label="Nombre"
                  value={selectedServicio.nombre}
                  onChange={(nombre) => {
                    setContent({
                      ...content,
                      servicios: content.servicios.map((s) => (s.id === selectedServicio.id ? { ...s, nombre } : s)),
                    });
                  }}
                />
                <LocalizedInput
                  label="Descripción"
                  value={selectedServicio.descripcion}
                  onChange={(descripcion) => {
                    setContent({
                      ...content,
                      servicios: content.servicios.map((s) => (s.id === selectedServicio.id ? { ...s, descripcion } : s)),
                    });
                  }}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gold uppercase">Precio COP</label>
                    <input
                      type="number"
                      className="w-full bg-bg border border-border rounded px-3 py-2 text-sm mt-1"
                      value={selectedServicio.precio}
                      onChange={(e) => {
                        setContent({
                          ...content,
                          servicios: content.servicios.map((s) =>
                            s.id === selectedServicio.id ? { ...s, precio: Number(e.target.value) } : s,
                          ),
                        });
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gold uppercase">Duración</label>
                    <input
                      className="w-full bg-bg border border-border rounded px-3 py-2 text-sm mt-1"
                      value={selectedServicio.duracion}
                      onChange={(e) => {
                        setContent({
                          ...content,
                          servicios: content.servicios.map((s) =>
                            s.id === selectedServicio.id ? { ...s, duracion: e.target.value } : s,
                          ),
                        });
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gold uppercase">Imagen</label>
                  {selectedServicio.imagen && <img src={selectedServicio.imagen} alt="" className="w-32 h-32 object-cover mt-2 rounded" />}
                  <input
                    type="file"
                    accept="image/*"
                    className="mt-2 text-sm disabled:opacity-50"
                    disabled={uploading || saving}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !selectedServicio) return;
                      e.target.value = '';
                      await handleUpload(file, (url) => ({
                        ...content,
                        servicios: content.servicios.map((s) =>
                          s.id === selectedServicio.id ? { ...s, imagen: url } : s,
                        ),
                      }));
                    }}
                  />
                  {uploading && <p className="text-xs text-muted mt-1 animate-pulse">Subiendo imagen...</p>}
                </div>
                <div className="flex gap-2">
                  <AdminButton loading={saving} success={saveFlash} className="flex-1" onClick={() => persist(content)}>
                    Guardar
                  </AdminButton>
                  <AdminButton
                    variant="danger"
                    loading={saving}
                    onClick={() => {
                      if (!confirm('¿Eliminar servicio?')) return;
                      persist({ ...content, servicios: content.servicios.filter((s) => s.id !== selectedServicio.id) });
                      setSelectedServicioId(null);
                    }}
                  >
                    Eliminar
                  </AdminButton>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'home' && (
          <div className="bg-surface border border-border p-6 rounded-lg space-y-6 max-w-lg">
            <div>
              <label className="text-xs text-gold uppercase">Imagen de fondo del sitio</label>
              <p className="text-xs text-muted mt-1 mb-2">
                Se muestra en todas las páginas públicas con un degradado oscuro encima.
              </p>
              {content.apariencia.fondo && (
                <img src={content.apariencia.fondo} alt="" className="w-full h-40 object-cover mt-2 rounded border border-border" />
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                <label className="inline-flex cursor-pointer items-center rounded border border-gold/40 px-4 py-2 text-xs uppercase tracking-widest text-gold hover:bg-gold/10">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={uploading || saving}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      e.target.value = '';
                      await handleUpload(file, (url) => ({
                        ...content,
                        apariencia: { ...content.apariencia, fondo: url },
                      }));
                    }}
                  />
                  Subir fondo
                </label>
                {content.apariencia.fondo && (
                  <AdminButton
                    variant="danger"
                    disabled={uploading || saving}
                    onClick={() => persist({ ...content, apariencia: { ...content.apariencia, fondo: '' } })}
                  >
                    Quitar fondo
                  </AdminButton>
                )}
              </div>
            </div>

            <div className="border-t border-border pt-6 space-y-4">
              <div>
                <p className="text-xs text-gold uppercase tracking-widest">Fondo en móvil</p>
                <p className="text-xs text-muted mt-1">
                  Define cómo se ve la imagen de fondo en celulares (el escritorio sigue cubriendo la pantalla).
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gold uppercase">Tamaño</label>
                  <select
                    className="w-full bg-bg border border-border rounded px-3 py-2 text-sm mt-1"
                    value={content.apariencia.fondoMovil.size}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        apariencia: {
                          ...content.apariencia,
                          fondoMovil: { ...content.apariencia.fondoMovil, size: e.target.value as Apariencia['fondoMovil']['size'] },
                        },
                      })
                    }
                  >
                    <option value="cover">Cubrir pantalla (cover)</option>
                    <option value="contain">Imagen completa (contain)</option>
                    <option value="auto">Tamaño original (auto)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gold uppercase">Posición</label>
                  <select
                    className="w-full bg-bg border border-border rounded px-3 py-2 text-sm mt-1"
                    value={content.apariencia.fondoMovil.position}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        apariencia: {
                          ...content.apariencia,
                          fondoMovil: { ...content.apariencia.fondoMovil, position: e.target.value as Apariencia['fondoMovil']['position'] },
                        },
                      })
                    }
                  >
                    <option value="center">Centro</option>
                    <option value="top">Arriba</option>
                    <option value="bottom">Abajo</option>
                    <option value="left">Izquierda</option>
                    <option value="right">Derecha</option>
                    <option value="top-left">Arriba izquierda</option>
                    <option value="top-right">Arriba derecha</option>
                    <option value="bottom-left">Abajo izquierda</option>
                    <option value="bottom-right">Abajo derecha</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={content.apariencia.fondoMovil.repeat}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      apariencia: {
                        ...content.apariencia,
                        fondoMovil: { ...content.apariencia.fondoMovil, repeat: e.target.checked },
                      },
                    })
                  }
                />
                Repetir como mosaico
              </label>
              <div>
                <label className="text-xs text-gold uppercase">
                  Opacidad del fondo: {content.apariencia.fondoMovil.opacity.toFixed(2)}
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  className="w-full mt-2 accent-[#c9a84c]"
                  value={content.apariencia.fondoMovil.opacity}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      apariencia: {
                        ...content.apariencia,
                        fondoMovil: { ...content.apariencia.fondoMovil, opacity: Number(e.target.value) },
                      },
                    })
                  }
                />
                <p className="text-xs text-muted mt-1">0 = sólo degradado oscuro · 1 = fondo completamente visible.</p>
              </div>
              <AdminButton
                loading={saving}
                success={saveFlash}
                disabled={!content.apariencia.fondo}
                onClick={() => persist(content)}
              >
                Guardar fondo móvil
              </AdminButton>
              {!content.apariencia.fondo && (
                <p className="text-xs text-muted">Sube una imagen de fondo arriba para aplicar cambios en móvil.</p>
              )}
            </div>
            <LocalizedInput
              label="Título hero"
              value={content.home.hero.titulo}
              onChange={(titulo) => setContent({ ...content, home: { ...content.home, hero: { ...content.home.hero, titulo } } })}
            />
            <LocalizedInput
              label="Subtítulo hero"
              value={content.home.hero.subtitulo}
              onChange={(subtitulo) => setContent({ ...content, home: { ...content.home, hero: { ...content.home.hero, subtitulo } } })}
            />
            <div>
              <label className="text-xs text-gold uppercase">Imagen hero</label>
              {content.home.hero.imagen && <img src={content.home.hero.imagen} alt="" className="w-full h-40 object-cover mt-2 rounded" />}
              <input
                type="file"
                accept="image/*"
                className="mt-2 text-sm disabled:opacity-50"
                disabled={uploading || saving}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  e.target.value = '';
                  await handleUpload(file, (url) => ({
                    ...content,
                    home: { ...content.home, hero: { ...content.home.hero, imagen: url } },
                  }));
                }}
              />
              {uploading && <p className="text-xs text-muted mt-1 animate-pulse">Subiendo imagen...</p>}
            </div>
            <AdminButton loading={saving} success={saveFlash} className="w-full" onClick={() => persist(content)}>
              Guardar home
            </AdminButton>
          </div>
        )}

        {tab === 'eventos' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <div className="flex justify-between mb-4">
                <h2 className="text-gold">Eventos</h2>
                <button
                  type="button"
                  className="text-xs bg-gold text-bg px-3 py-1"
                  onClick={() => {
                    const nuevo: Evento = {
                      id: uuid(),
                      slug: `evento-${Date.now()}`,
                      titulo: { es: 'Nuevo evento', en: 'New event' },
                      descripcion: { es: '', en: '' },
                      fecha: new Date().toISOString().slice(0, 10),
                      hora: '',
                      lugar: '',
                      imagen: '',
                      enlace: '',
                      activo: false,
                      destacado: false,
                      orden: (content.eventos ?? []).length,
                    };
                    const updated = { ...content, eventos: [...(content.eventos ?? []), nuevo] };
                    setContent(updated);
                    setSelectedEventoId(nuevo.id);
                    void persist(updated);
                  }}
                >
                  + Agregar
                </button>
              </div>
              <p className="text-xs text-muted mb-3">Solo se ven activos en la web pública.</p>
              <div className="space-y-2">
                {[...(content.eventos ?? [])].sort((a, b) => a.orden - b.orden).map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setSelectedEventoId(e.id)}
                    className={`w-full text-left p-3 border rounded text-sm ${selectedEventoId === e.id ? 'border-gold bg-gold/10' : 'border-border bg-surface'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${e.activo ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="flex-1 truncate">{e.titulo.es || '(sin título)'}</span>
                      <span className="text-xs text-muted">{e.fecha}</span>
                    </div>
                  </button>
                ))}
                {(!content.eventos || content.eventos.length === 0) && (
                  <p className="text-xs text-muted">Aún no hay eventos. Crea el primero con “+ Agregar”.</p>
                )}
              </div>
            </div>

            {(() => {
              const eventos = content.eventos ?? [];
              const selectedEvento = eventos.find((e) => e.id === selectedEventoId);
              if (!selectedEvento) {
                return <p className="text-muted text-sm">Selecciona un evento para editarlo.</p>;
              }
              const update = (patch: Partial<Evento>) => {
                const updated = eventos.map((e) => (e.id === selectedEvento.id ? { ...e, ...patch } : e));
                setContent({ ...content, eventos: updated });
              };
              return (
                <div className="bg-surface border border-border p-6 rounded-lg space-y-4">
                  <div className="flex flex-wrap justify-between gap-2">
                    <h3 className="text-gold">Editar evento</h3>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedEvento.activo}
                          onChange={(e) => update({ activo: e.target.checked })}
                        />
                        Activo
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedEvento.destacado}
                          onChange={(e) => update({ destacado: e.target.checked })}
                        />
                        Destacado
                      </label>
                    </div>
                  </div>
                  <LocalizedInput
                    label="Título"
                    value={selectedEvento.titulo}
                    onChange={(titulo) => update({ titulo })}
                  />
                  <div>
                    <label className="text-xs text-gold uppercase">Slug</label>
                    <input
                      className="w-full bg-bg border border-border rounded px-3 py-2 text-sm mt-1"
                      value={selectedEvento.slug}
                      onChange={(e) => update({ slug: e.target.value })}
                    />
                    <p className="text-xs text-muted mt-1">Solo letras minúsculas, números y guiones.</p>
                  </div>
                  <LocalizedInput
                    label="Descripción"
                    value={selectedEvento.descripcion}
                    onChange={(descripcion) => update({ descripcion })}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gold uppercase">Fecha</label>
                      <input
                        type="date"
                        className="w-full bg-bg border border-border rounded px-3 py-2 text-sm mt-1"
                        value={selectedEvento.fecha}
                        onChange={(e) => update({ fecha: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gold uppercase">Hora (opcional)</label>
                      <input
                        type="time"
                        className="w-full bg-bg border border-border rounded px-3 py-2 text-sm mt-1"
                        value={selectedEvento.hora || ''}
                        onChange={(e) => update({ hora: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gold uppercase">Lugar (opcional)</label>
                    <input
                      className="w-full bg-bg border border-border rounded px-3 py-2 text-sm mt-1"
                      value={selectedEvento.lugar}
                      onChange={(e) => update({ lugar: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gold uppercase">Enlace externo (opcional)</label>
                    <input
                      className="w-full bg-bg border border-border rounded px-3 py-2 text-sm mt-1"
                      placeholder="https://..."
                      value={selectedEvento.enlace}
                      onChange={(e) => update({ enlace: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gold uppercase">Imagen de portada</label>
                    {selectedEvento.imagen && (
                      <div className="relative inline-block mt-2">
                        <img src={selectedEvento.imagen} alt="" className="w-40 h-24 object-cover rounded border border-border" />
                        <button
                          type="button"
                          className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full"
                          onClick={() => update({ imagen: '' })}
                        >
                          ×
                        </button>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="mt-2 block w-full text-sm text-muted file:mr-4 file:cursor-pointer file:rounded file:border-0 file:bg-gold file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-widest file:text-bg hover:file:bg-gold-light disabled:opacity-50"
                      disabled={uploading || saving}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = '';
                        if (!file) return;
                        void handleUpload(file, (url) => ({
                          ...content,
                          eventos: (content.eventos ?? []).map((x) =>
                            x.id === selectedEvento.id ? { ...x, imagen: url } : x,
                          ),
                        }));
                      }}
                    />
                    {uploading && <p className="text-xs text-gold mt-2 animate-pulse">Subiendo imagen...</p>}
                  </div>
                  <div>
                    <label className="text-xs text-gold uppercase">Orden</label>
                    <input
                      type="number"
                      className="w-full bg-bg border border-border rounded px-3 py-2 text-sm mt-1"
                      value={selectedEvento.orden}
                      onChange={(e) => update({ orden: Number(e.target.value) })}
                    />
                    <p className="text-xs text-muted mt-1">Menor número aparece primero.</p>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <AdminButton loading={saving} success={saveFlash} className="flex-1" onClick={() => persist(content)}>
                      Guardar
                    </AdminButton>
                    <a
                      href="/eventos"
                      target="_blank"
                      rel="noopener"
                      className="px-4 py-2 border border-gold text-gold text-xs"
                    >
                      Vista previa
                    </a>
                    <AdminButton
                      variant="danger"
                      loading={saving}
                      onClick={() => {
                        if (!confirm('¿Eliminar este evento?')) return;
                        persist({
                          ...content,
                          eventos: (content.eventos ?? []).filter((e) => e.id !== selectedEvento.id),
                        });
                        setSelectedEventoId(null);
                      }}
                    >
                      Eliminar
                    </AdminButton>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {tab === 'contacto' && (
          <div className="bg-surface border border-border p-6 rounded-lg space-y-4 max-w-lg">
            <div>
              <label className="text-xs text-gold uppercase">WhatsApp</label>
              <input
                className="w-full bg-bg border border-border rounded px-3 py-2 text-sm mt-1"
                value={content.contacto.whatsapp}
                onChange={(e) => setContent({ ...content, contacto: { ...content.contacto, whatsapp: e.target.value } })}
              />
            </div>
            <LocalizedInput
              label="Dirección"
              value={content.contacto.direccion}
              onChange={(direccion) => setContent({ ...content, contacto: { ...content.contacto, direccion } })}
            />
            <LocalizedInput
              label="Horarios generales"
              value={content.contacto.horarios}
              onChange={(horarios) => setContent({ ...content, contacto: { ...content.contacto, horarios } })}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gold uppercase">Latitud mapa</label>
                <input
                  type="number"
                  step="any"
                  className="w-full bg-bg border border-border rounded px-3 py-2 text-sm mt-1"
                  value={content.contacto.mapa.lat}
                  onChange={(e) =>
                    setContent({ ...content, contacto: { ...content.contacto, mapa: { ...content.contacto.mapa, lat: Number(e.target.value) } } })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-gold uppercase">Longitud mapa</label>
                <input
                  type="number"
                  step="any"
                  className="w-full bg-bg border border-border rounded px-3 py-2 text-sm mt-1"
                  value={content.contacto.mapa.lng}
                  onChange={(e) =>
                    setContent({ ...content, contacto: { ...content.contacto, mapa: { ...content.contacto.mapa, lng: Number(e.target.value) } } })
                  }
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gold uppercase">Instagram (URL)</label>
              <input
                className="w-full bg-bg border border-border rounded px-3 py-2 text-sm mt-1"
                value={content.contacto.instagram}
                onChange={(e) => setContent({ ...content, contacto: { ...content.contacto, instagram: e.target.value } })}
              />
            </div>
            <AdminButton loading={saving} success={saveFlash} className="w-full" onClick={() => persist(content)}>
              Guardar contacto
            </AdminButton>
          </div>
        )}
      </main>
      <AdminToast saving={saving} uploading={uploading} message={message} />
    </div>
  );
}
