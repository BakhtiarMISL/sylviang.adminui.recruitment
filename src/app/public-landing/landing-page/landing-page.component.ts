import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, signal } from '@angular/core';
import { PRODUCTS } from '../../misl-landing/data/products.data';
import { Product } from '../../misl-landing/models/product.model';

@Component({
  selector: 'app-landing-page',
  standalone: false,
  templateUrl: './landing-page.component.html',
})
export class LandingPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('productSectionsHost', { static: true }) productSectionsHost!: ElementRef<HTMLElement>;

  readonly products: Product[] = PRODUCTS;
  readonly activeProductId = signal<string | null>(null);

  private productObserver?: IntersectionObserver;
  private isProgrammaticScroll = false;
  private programmaticScrollTimeout?: ReturnType<typeof setTimeout>;

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const sections = this.productSectionsHost.nativeElement.querySelectorAll<HTMLElement>('[data-product-id]');

    this.productObserver = new IntersectionObserver(
      (entries) => {
        if (this.isProgrammaticScroll) {
          return;
        }
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          const id = (visible[0].target as HTMLElement).dataset['productId'];
          if (id) {
            this.activeProductId.set(id);
          }
        }
      },
      { threshold: [0.2, 0.5], rootMargin: '-15% 0px -50% 0px' },
    );

    sections.forEach((section) => this.productObserver?.observe(section));
  }

  onProductSelected(id: string): void {
    this.activeProductId.set(id);

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
    this.productObserver?.disconnect();
    clearTimeout(this.programmaticScrollTimeout);
  }

  readonly stats = [
    { value: 1200, suffix: '+', label: 'Candidates Hired' },
    { value: 85, suffix: '+', label: 'Hiring Partners' },
    { value: 15, suffix: '', label: 'Avg. Days to Hire' },
    { value: 98, suffix: '%', label: 'Client Satisfaction' },
  ];

  readonly steps = [
    {
      icon: 'fa-magnifying-glass',
      title: 'Discover a Role',
      description: 'Browse live openings across engineering, HR, and operations, refreshed by our hiring teams every week.',
    },
    {
      icon: 'fa-file-circle-check',
      title: 'Apply in Minutes',
      description: 'Create an account once, then apply to as many roles as you like with a saved profile and documents.',
    },
    {
      icon: 'fa-comments',
      title: 'Track & Hear Back',
      description: 'Follow your application status live and get notified the moment a hiring manager responds.',
    },
  ];
}
