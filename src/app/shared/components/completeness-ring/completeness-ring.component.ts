import { Component, Input } from '@angular/core';

const RING_RADIUS = 42;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

@Component({
  selector: 'app-completeness-ring',
  standalone: false,
  templateUrl: './completeness-ring.component.html',
  styleUrl: './completeness-ring.component.scss',
})
export class CompletenessRingComponent {
  @Input() percentage = 0;

  readonly ringRadius = RING_RADIUS;
  readonly ringCircumference = RING_CIRCUMFERENCE;

  getRingOffset(): number {
    return RING_CIRCUMFERENCE - (RING_CIRCUMFERENCE * this.percentage) / 100;
  }

  getRingColorClass(): string {
    if (this.percentage < 34) return 'ring-danger';
    if (this.percentage < 67) return 'ring-warning';
    return 'ring-success';
  }
}
