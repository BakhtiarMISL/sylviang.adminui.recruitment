import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';

/* Animates the host's text content from 0 to [appCountUp] once it scrolls into view. */
@Directive({
  selector: '[appCountUp]',
  standalone: false,
})
export class CountUpDirective implements OnInit, OnDestroy {
  @Input('appCountUp') target = 0;
  @Input() countUpSuffix = '';
  @Input() countUpDuration = 1400;

  private observer?: IntersectionObserver;
  private frameId?: number;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    const element = this.el.nativeElement;

    if (typeof IntersectionObserver === 'undefined') {
      element.textContent = `${this.target}${this.countUpSuffix}`;
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.animate();
            this.observer?.unobserve(element);
          }
        });
      },
      { threshold: 0.4 },
    );
    this.observer.observe(element);
  }

  private animate(): void {
    const element = this.el.nativeElement;
    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - start) / this.countUpDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = `${Math.round(eased * this.target)}${this.countUpSuffix}`;

      if (progress < 1) {
        this.frameId = requestAnimationFrame(step);
      }
    };

    this.frameId = requestAnimationFrame(step);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
  }
}
