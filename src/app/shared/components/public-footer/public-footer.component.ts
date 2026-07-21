import { Component } from '@angular/core';

@Component({
  selector: 'app-public-footer',
  standalone: false,
  templateUrl: './public-footer.component.html',
})
export class PublicFooterComponent {
  currentYear = new Date().getFullYear();
}
