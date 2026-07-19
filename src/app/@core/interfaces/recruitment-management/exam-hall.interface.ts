export interface IExamHallRequest {
  hallName: string;
  location: string;
  totalCapacity: number;
  notifyInvigilatorsOnAssign: boolean;
  invigilatorEmployeeIds: number[];
}

export interface IExamHallResponse {
  examHallId: number;
  hallName: string;
  location: string;
  totalCapacity: number;
  notifyInvigilatorsOnAssign: boolean;
  isActive: boolean;
  invigilatorEmployeeIds: number[];
}

export interface IExamHallLookupResponse {
  examHallId: number;
  hallName: string;
}

export interface ISetActiveStatusRequest {
  isActive: boolean;
}
