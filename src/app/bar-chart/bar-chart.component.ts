import { Component, Input } from '@angular/core';

export interface BarItem {
  label: string;
  value: number;
  /** Lien facultatif (ex. vers la page d'un aéroport). */
  link?: any[];
}

/**
 * Diagramme en barres d'une seule série, en HTML : barres fines à bout arrondi,
 * infobulle au survol et vue tableau pour l'accessibilité.
 */
@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.css',
})
export class BarChartComponent {
  @Input() items: BarItem[] = [];
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
  @Input() unit = '';
  /** Libellé de la grandeur, pour l'infobulle et le tableau. */
  @Input() measure = 'Valeur';
  @Input() color = '#3987e5';

  hovered: BarItem | null = null;
  tooltip = { x: 0, y: 0 };
  showTable = false;

  get max(): number {
    return Math.max(1, ...this.items.map((i) => i.value));
  }

  get total(): number {
    return this.items.reduce((sum, i) => sum + i.value, 0);
  }

  share(item: BarItem): number {
    return this.total ? (item.value / this.total) * 100 : 0;
  }

  onEnter(item: BarItem, event: MouseEvent): void {
    this.hovered = item;
    this.onMove(event);
  }

  onMove(event: MouseEvent): void {
    this.tooltip = { x: event.clientX + 14, y: event.clientY + 14 };
  }
}
