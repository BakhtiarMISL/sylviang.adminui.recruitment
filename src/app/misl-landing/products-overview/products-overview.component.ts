import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ScrollRevealDirective } from '../directives/scroll-reveal.directive';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-products-overview',
  standalone: true,
  imports: [ProductCardComponent, ScrollRevealDirective],
  templateUrl: './products-overview.component.html',
  styleUrl: './products-overview.component.scss',
})
export class ProductsOverviewComponent {
  @Input({ required: true }) products: Product[] = [];
  @Input() activeId: string | null = null;
  @Output() productSelected = new EventEmitter<string>();

  onSelect(id: string): void {
    this.productSelected.emit(id);
  }
}
