import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BASE_URL_Recruitment } from '@env/environment';
import { CircularTypeEnum, EmploymentTypeEnum } from '@core/enums/recruitment.enum';
import { IJobApplicationSubmitRequest, IPublicJobPostingResponse } from '@core/interfaces/recruitment-management/career-portal.interface';
import { CareerPortalService } from './career-portal.service';

describe('CareerPortalService', () => {
  let service: CareerPortalService;
  let httpMock: HttpTestingController;
  const API_URL = `${BASE_URL_Recruitment}/career-portal`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CareerPortalService],
    });

    service = TestBed.inject(CareerPortalService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch paginated job postings via GET /job-postings', () => {
    const params = { pageNumber: 1, pageSize: 10 };

    service.getJobPostings(params).subscribe();

    const req = httpMock.expectOne((request) => request.url === `${API_URL}/job-postings`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('pageNumber')).toBe('1');
    expect(req.request.params.get('pageSize')).toBe('10');
    req.flush({ hasError: false, decentMessage: '', content: { data: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 0, hasPreviousPage: false, hasNextPage: false } });
  });

  it('should fetch a job posting by id via GET /job-postings/{id}', () => {
    service.getJobPostingById(5).subscribe();

    const req = httpMock.expectOne(`${API_URL}/job-postings/5`);
    expect(req.request.method).toBe('GET');
    req.flush({ hasError: false, decentMessage: '', content: {} as IPublicJobPostingResponse });
  });

  it('should submit an application via POST /job-postings/{id}/apply', () => {
    const request: IJobApplicationSubmitRequest = {
      candidateName: 'John Doe',
      candidateEmail: 'john@example.com',
    };
    const resume = new File(['dummy content'], 'resume.pdf', { type: 'application/pdf' });

    service.apply(5, request, resume).subscribe();

    const req = httpMock.expectOne(`${API_URL}/job-postings/5/apply`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    req.flush({ hasError: false, decentMessage: '', content: { jobApplicationId: 1, jobPostingId: 5, candidateName: 'John Doe', applicationStatus: 'Submitted', source: 'External' } });
  });

  it('should reference the correct enum values for reference data', () => {
    expect(EmploymentTypeEnum.FullTime).toBe('FullTime');
    expect(CircularTypeEnum.ExternalOnly).toBe('ExternalOnly');
  });
});
