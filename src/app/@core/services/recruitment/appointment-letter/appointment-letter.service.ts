import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { IAppointmentLetterGenerateRequest, IAppointmentLetterResponse } from '@core/interfaces/recruitment-management/appointment-letter.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class AppointmentLetterService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/appointment-letter';

  getAll(jobApplicationId?: number) {
    const params = jobApplicationId ? { jobApplicationId } : {};
    return this.httpClient.get<ApiResponse<IAppointmentLetterResponse[]>>(`${this.API_URL}`, { params });
  }

  getById(id: number) {
    return this.httpClient.get<ApiResponse<IAppointmentLetterResponse>>(`${this.API_URL}/${id}`);
  }

  generate(request: IAppointmentLetterGenerateRequest) {
    return this.httpClient.post<ApiResponse<IAppointmentLetterResponse>>(`${this.API_URL}/generate`, request);
  }
}
