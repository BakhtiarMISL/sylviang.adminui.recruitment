import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/ApiResponse';
import { IInterviewRoomRequest, IInterviewRoomResponse } from '@core/interfaces/recruitment-management/interview-room.interface';
import { ISetActiveStatusRequest } from '@core/interfaces/recruitment-management/exam-venue.interface';
import { BASE_URL_Recruitment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class InterviewRoomService {
  constructor(private httpClient: HttpClient) {}

  private roomsUrl(interviewVenueId: number) {
    return `${BASE_URL_Recruitment}/interview-venue/${interviewVenueId}/room`;
  }

  getAllByVenue(interviewVenueId: number) {
    return this.httpClient.get<ApiResponse<IInterviewRoomResponse[]>>(this.roomsUrl(interviewVenueId));
  }

  getById(interviewVenueId: number, roomId: number) {
    return this.httpClient.get<ApiResponse<IInterviewRoomResponse>>(`${this.roomsUrl(interviewVenueId)}/${roomId}`);
  }

  create(interviewVenueId: number, request: IInterviewRoomRequest) {
    return this.httpClient.post<ApiResponse<number>>(this.roomsUrl(interviewVenueId), request);
  }

  update(interviewVenueId: number, roomId: number, request: IInterviewRoomRequest) {
    return this.httpClient.put<ApiResponse<void>>(`${this.roomsUrl(interviewVenueId)}/${roomId}`, request);
  }

  setActiveStatus(interviewVenueId: number, roomId: number, request: ISetActiveStatusRequest) {
    return this.httpClient.patch<ApiResponse<void>>(`${this.roomsUrl(interviewVenueId)}/${roomId}/active-status`, request);
  }
}
