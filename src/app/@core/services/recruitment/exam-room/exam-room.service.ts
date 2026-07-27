import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { IExamRoomRequest, IExamRoomResponse } from '@core/interfaces/recruitment-management/exam-room.interface';
import { ISetActiveStatusRequest } from '@core/interfaces/recruitment-management/exam-venue.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class ExamRoomService {
  constructor(private httpClient: HttpClient) {}

  private roomsUrl(examVenueId: number) {
    return `${BASE_URL_Recruitment}/exam-venue/${examVenueId}/room`;
  }

  getAllByVenue(examVenueId: number) {
    return this.httpClient.get<ApiResponse<IExamRoomResponse[]>>(this.roomsUrl(examVenueId));
  }

  getById(examVenueId: number, roomId: number) {
    return this.httpClient.get<ApiResponse<IExamRoomResponse>>(`${this.roomsUrl(examVenueId)}/${roomId}`);
  }

  create(examVenueId: number, request: IExamRoomRequest) {
    return this.httpClient.post<ApiResponse<number>>(this.roomsUrl(examVenueId), request);
  }

  update(examVenueId: number, roomId: number, request: IExamRoomRequest) {
    return this.httpClient.put<ApiResponse<void>>(`${this.roomsUrl(examVenueId)}/${roomId}`, request);
  }

  setActiveStatus(examVenueId: number, roomId: number, request: ISetActiveStatusRequest) {
    return this.httpClient.patch<ApiResponse<void>>(`${this.roomsUrl(examVenueId)}/${roomId}/active-status`, request);
  }
}
