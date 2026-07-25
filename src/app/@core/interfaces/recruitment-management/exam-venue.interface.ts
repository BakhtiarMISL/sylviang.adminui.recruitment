export interface IExamVenueRequest {
  venueName: string;
  location: string;
}

export interface IExamVenueResponse {
  examVenueId: number;
  venueName: string;
  location: string;
  isActive: boolean;
  roomCount: number;
}

export interface IExamVenueLookupResponse {
  examVenueId: number;
  venueName: string;
}

export interface ISetActiveStatusRequest {
  isActive: boolean;
}
