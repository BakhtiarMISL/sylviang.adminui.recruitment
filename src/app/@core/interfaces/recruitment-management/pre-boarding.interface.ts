import { PreBoardingSubmissionStatusEnum } from '@core/enums/recruitment.enum';

export interface IPreBoardingNomineeRequest {
  fullName: string;
  relationship: string;
  sharePercentage: number;
  contactPhone?: string | null;
  address?: string | null;
}

export interface IPreBoardingNomineeResponse extends IPreBoardingNomineeRequest {
  preBoardingNomineeId: number;
}

export interface IPreBoardingSaveRequest {
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  insuranceProvider?: string | null;
  insurancePolicyNumber?: string | null;
  insuranceNotes?: string | null;
  bankName: string;
  bankBranch?: string | null;
  bankAccountName: string;
  bankAccountNumber: string;
  bankRoutingNumber?: string | null;
  nominees: IPreBoardingNomineeRequest[];
}

export interface IPreBoardingSubmissionResponse extends IPreBoardingSaveRequest {
  preBoardingSubmissionId: number;
  finalSelectionPoolId: number;
  status: PreBoardingSubmissionStatusEnum;
  submittedAt?: string | null;
  nominees: IPreBoardingNomineeResponse[];
}
