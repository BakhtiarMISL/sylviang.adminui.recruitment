import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IHiringPipelineCreateRequest, IPipelineStage } from '@app/@core/interfaces/recruitment-management/hiring-pipeline.interface';
import { HiringPipelineService } from '@app/@core/services/recruitment/hiring-pipeline/hiring-pipeline.service';
import { BreadcrumbService } from '@app/@core/services';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { newStage, SuggestedStageTypes } from './manage-hiring-pipeline.component.constants';

@Component({
  selector: 'app-manage-hiring-pipeline',
  standalone: false,
  templateUrl: './manage-hiring-pipeline.component.html',
  styleUrl: './manage-hiring-pipeline.component.scss',
})
export class ManageHiringPipelineComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private hiringPipelineService: HiringPipelineService,
    private route: ActivatedRoute,
    private router: Router,
    private breadcrumbService: BreadcrumbService,
  ) {}

  pipelineForm!: FormGroup;
  stages: IPipelineStage[] = [];
  expandedStageIndex: number | null = null;

  formSubmitted = false;
  isEditMode = false;
  hiringPipelineId: number | null = null;
  errorMessage = '';

  suggestedStageTypes = SuggestedStageTypes;
  filteredStageTypes: string[] = [];

  filterStageType(event: AutoCompleteCompleteEvent): void {
    const query = event.query.trim().toLowerCase();
    this.filteredStageTypes = this.suggestedStageTypes.filter((t) => t.toLowerCase().includes(query));
  }

  ngOnInit(): void {
    this.pipelineForm = this.fb.group({
      name: [null, [Validators.required, Validators.maxLength(200)]],
      description: [null],
    });

    this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.hiringPipelineId = +idParam;
        this.isEditMode = true;
        this.loadPipeline(this.hiringPipelineId);
      } else {
        this.isEditMode = false;
        this.hiringPipelineId = null;
        this.stages = [newStage(0)];
      }
      this.setBreadcrumbs();
    });
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.setBreadcrumbs([
      { title: 'Recruitment', icon: 'fa-solid fa-briefcase', href: '/hiring-pipeline/hiring-pipeline-list' },
      { title: 'Hiring Pipelines', icon: 'fa-solid fa-diagram-project', href: '/hiring-pipeline/hiring-pipeline-list' },
      { title: this.isEditMode ? 'Edit Pipeline' : 'Add Pipeline', icon: 'fa-solid fa-edit', href: '/hiring-pipeline/manage-hiring-pipeline' },
    ]);
  }

  private loadPipeline(id: number): void {
    this.hiringPipelineService.getById(id).subscribe({
      next: (response) => {
        if (response && !response.hasError && response.content) {
          this.pipelineForm.patchValue({ name: response.content.name, description: response.content.description });
          this.stages = [...response.content.stages].sort((a, b) => a.displayOrder - b.displayOrder);
        } else {
          this.router.navigate(['/hiring-pipeline/hiring-pipeline-list']);
        }
      },
      error: () => {
        this.router.navigate(['/hiring-pipeline/hiring-pipeline-list']);
      },
    });
  }

  get f() {
    return this.pipelineForm.controls;
  }

  hasError(fieldName: string): boolean {
    const field = this.pipelineForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.formSubmitted));
  }

  toggleStageExpanded(index: number): void {
    this.expandedStageIndex = this.expandedStageIndex === index ? null : index;
  }

  addStage(): void {
    this.stages.push(newStage(this.stages.length));
    this.expandedStageIndex = this.stages.length - 1;
  }

  removeStage(index: number): void {
    this.stages.splice(index, 1);
    this.stages.forEach((s, i) => (s.displayOrder = i));
    this.expandedStageIndex = null;
  }

  onStageDrop(event: CdkDragDrop<IPipelineStage[]>): void {
    moveItemInArray(this.stages, event.previousIndex, event.currentIndex);
    this.stages.forEach((s, i) => (s.displayOrder = i));
  }

  stageIsInvalid(stage: IPipelineStage): boolean {
    return !stage.name?.trim() || !stage.stageType?.trim() || this.marksAreInvalid(stage);
  }

  marksAreInvalid(stage: IPipelineStage): boolean {
    return stage.maxMarks != null && stage.passMarks != null && stage.passMarks > stage.maxMarks;
  }

  otherStageOptions(currentIndex: number): { label: string; value: number }[] {
    return this.stages
      .map((s, i) => ({ label: s.name?.trim() || `Stage ${i + 1}`, value: s.displayOrder, index: i }))
      .filter((option) => option.index !== currentIndex)
      .map(({ label, value }) => ({ label, value }));
  }

  get hasInvalidStages(): boolean {
    return this.stages.length === 0 || this.stages.some((s) => this.stageIsInvalid(s));
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.errorMessage = '';

    if (this.pipelineForm.invalid) {
      this.pipelineForm.markAllAsTouched();
      return;
    }

    if (this.hasInvalidStages) {
      this.errorMessage = 'Every stage needs a name and a stage type, pass marks must not exceed max marks, and the pipeline needs at least one stage.';
      return;
    }

    const request: IHiringPipelineCreateRequest = {
      name: this.pipelineForm.value.name,
      description: this.pipelineForm.value.description,
      stages: this.stages,
    };

    if (this.isEditMode && this.hiringPipelineId) {
      this.hiringPipelineService.update(this.hiringPipelineId, request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/hiring-pipeline/hiring-pipeline-list']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to update pipeline';
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to update pipeline';
        },
      });
    } else {
      this.hiringPipelineService.create(request).subscribe({
        next: (response) => {
          if (response && !response.hasError) {
            this.router.navigate(['/hiring-pipeline/hiring-pipeline-list']);
          } else {
            this.errorMessage = response?.decentMessage || 'Failed to create pipeline';
          }
        },
        error: (error) => {
          this.errorMessage = error?.error?.decentMessage || 'Failed to create pipeline';
        },
      });
    }
  }
}
