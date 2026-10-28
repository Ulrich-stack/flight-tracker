import * as L from 'leaflet';
import { Aircraft } from './aircraft';

const PLANE_PATH = new Path2D(
  'M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z'
);

export const PLANE_COLOR = '#d9dcdf';
export const SELECTED_COLOR = '#3fa58f';
export const GROUND_COLOR = '#8b8f93';

/** Rampe séquentielle (une teinte, validée sur fond sombre) : bas → haut. */
export const ALTITUDE_BANDS: { max: number; color: string; label: string }[] = [
  { max: 3000, color: '#2a78d6', label: '< 3 000 m' },
  { max: 7000, color: '#5598e7', label: '3 000 – 7 000 m' },
  { max: 10000, color: '#86b6ef', label: '7 000 – 10 000 m' },
  { max: Infinity, color: '#cde2fb', label: '> 10 000 m' },
];

export function altitudeColor(a: Aircraft): string {
  if (a.onGround) {
    return GROUND_COLOR;
  }
  const alt = a.altitude ?? a.geoAltitude ?? 0;
  return ALTITUDE_BANDS.find((b) => alt < b.max)!.color;
}

export interface PlaneLayerOptions {
  /** Position à afficher (permet l'extrapolation entre deux actualisations). */
  position: (a: Aircraft) => [number, number];
  color?: (a: Aircraft) => string;
  size?: number;
  interactive?: boolean;
  onSelect?: (a: Aircraft | null) => void;
}

/**
 * Calque canvas : dessine des milliers d'avions orientés en une seule passe,
 * là où un marqueur DOM par avion deviendrait trop lourd.
 */
export class PlaneLayer extends L.Layer {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private planes: Aircraft[] = [];
  private selectedId: string | null = null;
  /** Positions écran du dernier dessin, pour la détection du clic. */
  private hits: { a: Aircraft; x: number; y: number }[] = [];
  private frame = 0;

  constructor(private opts: PlaneLayerOptions) {
    super();
  }

  setPlanes(planes: Aircraft[]): void {
    this.planes = planes;
    this.redraw();
  }

  setSelected(icao24: string | null): void {
    this.selectedId = icao24;
    this.redraw();
  }

  setColor(color: (a: Aircraft) => string): void {
    this.opts.color = color;
    this.redraw();
  }

  override onAdd(map: L.Map): this {
    this.canvas = L.DomUtil.create('canvas', 'plane-layer') as HTMLCanvasElement;
    Object.assign(this.canvas.style, { position: 'absolute', pointerEvents: 'none' });
    this.ctx = this.canvas.getContext('2d')!;
    // Volet dédié : au-dessus des tracés (400), sous les marqueurs d'aéroport (600).
    const pane = map.getPane('planes') ?? map.createPane('planes');
    pane.style.zIndex = '450';
    pane.style.pointerEvents = 'none';
    pane.appendChild(this.canvas);

    map.on('move resize zoomend viewreset', this.redraw, this);
    map.on('zoomstart', this.hide, this);
    if (this.opts.interactive) {
      map.on('click', this.onClick, this);
      map.on('mousemove', this.onMouseMove, this);
    }
    this.resize();
    this.redraw();
    return this;
  }

  override onRemove(map: L.Map): this {
    map.off('move resize zoomend viewreset', this.redraw, this);
    map.off('zoomstart', this.hide, this);
    map.off('click', this.onClick, this);
    map.off('mousemove', this.onMouseMove, this);
    cancelAnimationFrame(this.frame);
    this.canvas.remove();
    return this;
  }

  /** Redessin regroupé sur la prochaine image. */
  redraw(): void {
    if (!this.ctx || this.frame) {
      return;
    }
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.draw();
    });
  }

  private hide(): void {
    this.canvas.style.visibility = 'hidden';
  }

  private resize(): void {
    const size = this._map.getSize();
    const ratio = window.devicePixelRatio || 1;
    if (this.canvas.width !== size.x * ratio || this.canvas.height !== size.y * ratio) {
      this.canvas.width = size.x * ratio;
      this.canvas.height = size.y * ratio;
      this.canvas.style.width = `${size.x}px`;
      this.canvas.style.height = `${size.y}px`;
    }
  }

  private draw(): void {
    const map = this._map;
    if (!map) {
      return;
    }
    this.resize();
    // Le volet suit les déplacements de la carte : on recale le canvas sur le coin du conteneur.
    L.DomUtil.setPosition(this.canvas, map.containerPointToLayerPoint([0, 0]));
    this.canvas.style.visibility = 'visible';
    const ratio = window.devicePixelRatio || 1;
    const ctx = this.ctx;
    const size = map.getSize();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const base = this.opts.size ?? 14;
    // Les avions rétrécissent quand on dézoome, pour que la carte reste lisible.
    const scale = Math.max(0.5, Math.min(1.2, 0.2 + map.getZoom() * 0.11));
    const s = base * scale;
    const hits: typeof this.hits = [];
    let selected: { a: Aircraft; x: number; y: number } | null = null;

    for (const a of this.planes) {
      const [lat, lng] = this.opts.position(a);
      const p = map.latLngToContainerPoint([lat, lng]);
      if (p.x < -20 || p.y < -20 || p.x > size.x + 20 || p.y > size.y + 20) {
        continue;
      }
      hits.push({ a, x: p.x, y: p.y });
      if (a.icao24 === this.selectedId) {
        selected = { a, x: p.x, y: p.y };
        continue;
      }
      this.plane(ctx, p.x, p.y, a.heading ?? 0, s, this.opts.color?.(a) ?? PLANE_COLOR, ratio);
    }

    // L'avion sélectionné est dessiné en dernier, plus grand, au-dessus des autres.
    if (selected) {
      this.plane(ctx, selected.x, selected.y, selected.a.heading ?? 0, s * 1.6, SELECTED_COLOR, ratio);
    }
    this.hits = hits;
  }

  private plane(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    heading: number,
    size: number,
    color: string,
    ratio: number
  ): void {
    const k = (size / 24) * ratio;
    ctx.setTransform(k, 0, 0, k, x * ratio, y * ratio);
    ctx.rotate((heading * Math.PI) / 180);
    ctx.translate(-12, -12);
    ctx.fillStyle = color;
    ctx.strokeStyle = '#121314';
    ctx.lineWidth = 1.2;
    ctx.stroke(PLANE_PATH);
    ctx.fill(PLANE_PATH);
  }

  private nearest(point: L.Point): Aircraft | null {
    let best: Aircraft | null = null;
    let bestD = 12 * 12; // rayon de clic : 12px
    for (const h of this.hits) {
      const d = (h.x - point.x) ** 2 + (h.y - point.y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = h.a;
      }
    }
    return best;
  }

  private onClick(e: L.LeafletMouseEvent): void {
    this.opts.onSelect?.(this.nearest(e.containerPoint));
  }

  private onMouseMove(e: L.LeafletMouseEvent): void {
    this._map.getContainer().style.cursor = this.nearest(e.containerPoint) ? 'pointer' : '';
  }
}
