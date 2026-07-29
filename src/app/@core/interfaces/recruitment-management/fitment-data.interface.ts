export interface IFitmentDataResponse {
  fitmentDataId: number;
  jobApplicationId: number;
  designation: string;
  grade?: string | null;
  location?: string | null;
  basicSalary: number;
  totalAllowances: number;
  totalDeductions: number;
}

export interface IFitmentDataUpsertRequest {
  jobApplicationId: number;
  designation: string;
  grade?: string | null;
  location?: string | null;
  basicSalary: number;
  totalAllowances: number;
  totalDeductions: number;
}
