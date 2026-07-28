import { Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';

/* Adds `.is-visible` the first time the host scrolls into view, then stops observing.
   Falls back to immediately visible when IntersectionObserver isn't available (SSR/old browsers). */
@Directive({
  selector: '[appReveal]',
  standalone: false,
})
export class RevealOnScrollDirective implements OnInit, OnDestroy {
  @Input('appRevealDelay') delay = 0;

  private observer?: IntersectionObserver;

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
  ) {}

  ngOnInit(): void {
    const element = this.el.nativeElement;
    this.renderer.addClass(element, 'reveal-on-scroll');

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
