export interface IInterviewVenueRequest {
  venueName: string;
  location: string;
}

export interface IInterviewVenueResponse {
  interviewVenueId: number;
  venueName: string;
  location: string;
  isActive: boolean;
  roomCount: number;
}

export interface IInterviewVenueLookupResponse {
  interviewVenueId: number;
  venueName: string;
}
