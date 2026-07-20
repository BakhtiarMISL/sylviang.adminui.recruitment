export interface IExamRoomRequest {
  roomName: string;
  capacity: number;
  notifyInvigilatorsOnAssign: boolean;
  invigilatorEmployeeIds: number[];
}

export interface IExamRoomResponse {
  examRoomId: number;
  examVenueId: number;
  roomName: string;
  capacity: number;
  notifyInvigilatorsOnAssign: boolean;
  isActive: boolean;
  invigilatorEmployeeIds: number[];
}
