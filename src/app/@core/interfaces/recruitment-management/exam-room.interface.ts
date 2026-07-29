export interface IExamRoomRequest {
  roomName: string;
  capacity: number;
  requiredInvigilatorCount: number;
}

export interface IExamRoomResponse {
  examRoomId: number;
  examVenueId: number;
  roomName: string;
  capacity: number;
  requiredInvigilatorCount: number;
  isActive: boolean;
}
