import { Component, Input } from '@angular/core';
import { ScrollRevealDirective } from '../directives/scroll-reveal.directive';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-product-section',
  standalone: true,
  imports: [ScrollRevealDirective],
  templateUrl: './product-section.component.html',
  styleUrl: './product-section.component.scss',
})
export class ProductSectionComponent {
  @Input({ required: true }) product!: Product;
  @Input() reversed = false;

  get imageAnimation(): 'fade-left' | 'fade-right' {
    return this.reversed ? 'fade-right' : 'fade-left';
  }

  get contentAnimation(): 'fade-left' | 'fade-right' {
    return this.reversed ? 'fade-left' : 'fade-right';
  }

  get isExternalLink(): boolean {
    return this.product.ctaLink.startsWith('http');
  }
}
