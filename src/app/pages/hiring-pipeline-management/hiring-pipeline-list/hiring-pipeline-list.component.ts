import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IHiringPipelineResponse } from '@app/@core/interfaces/recruitment-management/hiring-pipeline.interface';
import { HiringPipelineService } from '@app/@core/services/recruitment/hiring-pipeline/hiring-pipeline.service';
import { BreadcrumbService } from '@app/@core/services';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-hiring-pipeline-list',
  standalone: false,
  templateUrl: './hiring-pipeline-list.component.html',
  styleUrl: './hiring-pipeline-list.component.scss',
})
export class HiringPipelineListComponent implements OnInit {
  constructor(
    private hiringPipelineService: HiringPipelineService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
    private breadcrumbService: BreadcrumbService,
  ) {}

  pipelines: IHiringPipelineResponse[] = [];
  loading = false;

  get skeletonItems() {
    return Array(3)
      .fill({})
      .map((_, index) => ({ id: index }));
  }

  ngOnInit(): void {
    this.setBreadcrumbs();
    this.loadPipelines();
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'Recruitment', icon: 'fa-solid fa-briefcase', href: '/hiring-pipeline/hiring-pipeline-list' },
      { title: 'Hiring Pipelines', icon: 'fa-solid fa-diagram-project', href: '/hiring-pipeline/hiring-pipeline-list' },
    ]);
  }

  loadPipelines(): void {
    this.loading = true;
    this.hiringPipelineService.getAll().subscribe({
      next: (response) => {
        this.pipelines = !response.hasError && response.content ? response.content : [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.pipelines = [];
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  toggleActive(pipeline: IHiringPipelineResponse): void {
    const nextState = !pipeline.isActive;
    this.hiringPipelineService.setActive(pipeline.hiringPipelineId, nextState).subscribe({
      next: () => {
        pipeline.isActive = nextState;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error updating pipeline active state:', error);
      },
    });
  }

  duplicatePipeline(pipeline: IHiringPipelineResponse): void {
    this.hiringPipelineService.duplicate(pipeline.hiringPipelineId).subscribe({
      next: () => {
        this.loadPipelines();
      },
      error: (error) => {
        console.error('Error duplicating pipeline:', error);
      },
    });
  }

  deletePipeline(pipeline: IHiringPipelineResponse, event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to delete pipeline: ${pipeline.name}?`,
      header: 'Delete Confirmation',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'fa fa-check',
      rejectIcon: 'fa fa-times',
      accept: () => {
        this.hiringPipelineService.delete(pipeline.hiringPipelineId).subscribe({
          next: () => {
            this.loadPipelines();
          },
          error: (error) => {
            console.error('Error deleting pipeline:', error);
          },
        });
      },
    });
  }
}
