import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { IAppointmentLetterResponse } from '@core/interfaces/recruitment-management/appointment-letter.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class AppointmentLetterCandidateService {
  constructor(private httpClient: HttpClient) {}

  API_URL = BASE_URL_Recruitment + '/me/appointment-letter';

  getAll() {
    return this.httpClient.get<ApiResponse<IAppointmentLetterResponse[]>>(`${this.API_URL}`);
  }

  getById(id: number) {
    return this.httpClient.get<ApiResponse<IAppointmentLetterResponse>>(`${this.API_URL}/${id}`);
  }
}
