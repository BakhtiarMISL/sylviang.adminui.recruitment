import { Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';

/* Adds `.is-visible` the first time the host scrolls into view, then stops observing. */
@Directive({
  selector: '[mislReveal]',
  standalone: true,
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  @Input('mislReveal') animation: 'fade-up' | 'fade-left' | 'fade-right' | 'zoom' = 'fade-up';
  @Input('mislRevealDelay') delay = 0;

  private observer?: IntersectionObserver;

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
  ) {}

  ngOnInit(): void {
    const element = this.el.nativeElement;
    this.renderer.addClass(element, 'msl-reveal');
    this.renderer.addClass(element, `msl-reveal--${this.animation}`);

    if (this.delay) {
      this.renderer.setStyle(element, 'transition-delay', `${this.delay}ms`);
    }

    if (typeof IntersectionObserver === 'undefined') {
      this.renderer.addClass(element, 'is-visible');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.renderer.addClass(element, 'is-visible');
            this.observer?.unobserve(element);
          }
        });
      },
      { threshold: 0.15 },
    );
    this.observer.observe(element);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
