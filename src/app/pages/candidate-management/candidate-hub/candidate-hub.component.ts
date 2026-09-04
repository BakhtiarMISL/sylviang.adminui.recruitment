import { Component, OnInit } from '@angular/core';
import { BreadcrumbService } from '@app/@core/services';

@Component({
  selector: 'app-candidate-hub',
  standalone: false,
  templateUrl: './candidate-hub.component.html',
})
export class CandidateHubComponent implements OnInit {
  constructor(private breadcrumbService: BreadcrumbService) {}

  activeTab = '0';

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([{ title: 'Candidates', icon: 'fa-solid fa-users', href: '/candidates' }]);
  }
}
