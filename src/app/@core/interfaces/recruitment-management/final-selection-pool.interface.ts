export interface IFinalSelectionPoolResponse {
  finalSelectionPoolId: number;
  offerLetterId: number;
  jobApplicationId: number;
  candidateName: string;
  designation: string;
  batchLabel?: string | null;
  joiningDate: string;
  hasJoined: boolean;
  joinedAt?: string | null;
  enteredPoolAt: string;
  /** Null when the candidate hasn't touched the pre-boarding form yet. */
  preBoardingStatus?: string | null;
}

export interface IFinalSelectionPoolUpdateBatchRequest {
  batchLabel?: string | null;
  joiningDate: string;
}
