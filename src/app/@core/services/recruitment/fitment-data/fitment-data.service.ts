import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { IFitmentDataResponse, IFitmentDataUpsertRequest } from '@core/interfaces/recruitment-management/fitment-data.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class FitmentDataService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/fitment-data';

  getByJobApplication(jobApplicationId: number) {
    return this.httpClient.get<ApiResponse<IFitmentDataResponse | null>>(`${this.API_URL}/by-job-application/${jobApplicationId}`);
  }

  upsert(request: IFitmentDataUpsertRequest) {
    return this.httpClient.put<ApiResponse<IFitmentDataResponse>>(`${this.API_URL}`, request);
  }
}
