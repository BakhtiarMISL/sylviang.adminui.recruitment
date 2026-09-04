import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BASE_URL_Recruitment } from '@env/environment';
import { CircularTypeEnum, EmploymentTypeEnum, JobStatusEnum } from '@core/enums/recruitment.enum';
import { IJobVacancyCreateRequest, IJobVacancyResponse, IJobVacancyUpdateRequest } from '@core/interfaces/recruitment-management/job-vacancy.interface';
import { JobVacancyService } from './job-vacancy.service';

describe('JobVacancyService', () => {
  let service: JobVacancyService;
  let httpMock: HttpTestingController;
  const API_URL = `${BASE_URL_Recruitment}/job-posting`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [JobVacancyService],
    });

    service = TestBed.inject(JobVacancyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch paginated job vacancies via GET /paged', () => {
    const params = { pageNumber: 1, pageSize: 10 };

    service.getJobVacanciesPaginated(params).subscribe();

    const req = httpMock.expectOne((request) => request.url === `${API_URL}/paged`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('pageNumber')).toBe('1');
    expect(req.request.params.get('pageSize')).toBe('10');
    req.flush({ hasError: false, decentMessage: '', content: { data: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 0, hasPreviousPage: false, hasNextPage: false } });
  });

  it('should fetch a job vacancy by id via GET /{id}', () => {
    service.getJobVacancyById(5).subscribe();

    const req = httpMock.expectOne(`${API_URL}/5`);
    expect(req.request.method).toBe('GET');
    req.flush({ hasError: false, decentMessage: '', content: {} as IJobVacancyResponse });
  });

  it('should create a job vacancy via POST', () => {
    const request: IJobVacancyCreateRequest = {
      title: 'Software Engineer',
      numberOfPositions: 1,
      employmentType: EmploymentTypeEnum.FullTime,
      circularType: CircularTypeEnum.Both,
      hiringPipelineId: 1,
    };

    service.addJobVacancy(request).subscribe();

    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush({ hasError: false, decentMessage: '', content: 1 });
  });

  it('should update a job vacancy via PUT /{id}', () => {
    const request: IJobVacancyUpdateRequest = {
      jobPostingId: 5,
      title: 'Software Engineer',
      numberOfPositions: 1,
      employmentType: EmploymentTypeEnum.FullTime,
      circularType: CircularTypeEnum.Both,
      status: JobStatusEnum.Open,
      hiringPipelineId: 1,
    };

    service.updateJobVacancy(5, request).subscribe();

    const req = httpMock.expectOne(`${API_URL}/5`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush({ hasError: false, decentMessage: '', content: undefined });
  });

  it('should delete a job vacancy via DELETE /{id}', () => {
    service.deleteJobVacancy(5).subscribe();

    const req = httpMock.expectOne(`${API_URL}/5`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
