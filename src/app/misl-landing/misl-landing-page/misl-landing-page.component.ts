import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, signal } from '@angular/core';
import { ProductsOverviewComponent } from '../products-overview/products-overview.component';
import { ProductSectionComponent } from '../product-section/product-section.component';
import { ScrollRevealDirective } from '../directives/scroll-reveal.directive';
import { PRODUCTS } from '../data/products.data';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-misl-landing-page',
  standalone: true,
  imports: [ProductsOverviewComponent, ProductSectionComponent, ScrollRevealDirective],
  templateUrl: './misl-landing-page.component.html',
  styleUrl: './misl-landing-page.component.scss',
})
export class MislLandingPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('sectionsHost', { static: true }) sectionsHost!: ElementRef<HTMLElement>;

  readonly products: Product[] = PRODUCTS;
  readonly activeId = signal<string>(PRODUCTS[0].id);

  private observer?: IntersectionObserver;
  private isProgrammaticScroll = false;
  private programmaticScrollTimeout?: ReturnType<typeof setTimeout>;

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const sections = this.sectionsHost.nativeElement.querySelectorAll<HTMLElement>('[data-product-id]');

    this.observer = new IntersectionObserver(
      (entries) => {
        if (this.isProgrammaticScroll) {
          return;
        }
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          const id = (visible[0].target as HTMLElement).dataset['productId'];
          if (id) {
            this.activeId.set(id);
          }
        }
      },
      { threshold: [0.2, 0.5], rootMargin: '-15% 0px -50% 0px' },
    );

    sections.forEach((section) => this.observer?.observe(section));
  }

  onProductSelected(id: string): void {
    this.activeId.set(id);

    const target = document.getElementById(id);
    if (!target) {
      return;
    }

    this.isProgrammaticScroll = true;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    clearTimeout(this.programmaticScrollTimeout);
    this.programmaticScrollTimeout = setTimeout(() => {
      this.isProgrammaticScroll = false;
    }, 900);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    clearTimeout(this.programmaticScrollTimeout);
  }
}
