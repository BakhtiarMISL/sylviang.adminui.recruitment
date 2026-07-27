import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-filter-panel',
  standalone: false,
  templateUrl: './filter-panel.component.html',
})
export class FilterPanelComponent {
  @Input() title = 'Filters';
  @Input() collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  toggle(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }
}
