import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbService } from '@app/@core/services';

@Component({
  selector: 'app-candidate-hub',
  standalone: false,
  templateUrl: './candidate-hub.component.html',
})
export class CandidateHubComponent implements OnInit {
  constructor(
    private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  activeTab = '0';

  ngOnInit(): void {
    this.breadcrumbService.setBreadcrumbs([{ title: 'Candidates', icon: 'fa-solid fa-users', href: '/candidates' }]);
    // Kept in the URL so refresh doesn't silently drop back to Browse and lose the
    // Search/CV-Bank tab HR was on.
    this.activeTab = this.route.snapshot.queryParamMap.get('tab') ?? '0';
  }

  onTabChange(value: string): void {
    this.activeTab = value;
    this.router.navigate([], { relativeTo: this.route, queryParams: { tab: value }, queryParamsHandling: 'merge', replaceUrl: true });
  }
}
