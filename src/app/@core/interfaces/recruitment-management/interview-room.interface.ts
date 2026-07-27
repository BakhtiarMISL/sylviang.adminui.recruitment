export interface IInterviewRoomRequest {
  roomName: string;
  capacity: number;
}

export interface IInterviewRoomResponse {
  interviewRoomId: number;
  interviewVenueId: number;
  roomName: string;
  capacity: number;
  isActive: boolean;
}
