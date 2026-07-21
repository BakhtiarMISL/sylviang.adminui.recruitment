import { MobileOperatorEnum } from '@app/@core/enums/recruitment.enum';

export const MobileOperatorOptions = [
  { label: 'Grameenphone', value: MobileOperatorEnum.Grameenphone },
  { label: 'Banglalink', value: MobileOperatorEnum.Banglalink },
  { label: 'Robi', value: MobileOperatorEnum.Robi },
  { label: 'Airtel', value: MobileOperatorEnum.Airtel },
  { label: 'Teletalk', value: MobileOperatorEnum.Teletalk },
  { label: 'Other', value: MobileOperatorEnum.Other },
];

// Leading 3 digits implied by the chosen operator - the candidate only types the remaining 8
// digits. "Other" has no fixed prefix, so the 8-digit field alone becomes the stored number.
export const MobileOperatorPrefixes: Record<string, string> = {
  [MobileOperatorEnum.Grameenphone]: '017',
  [MobileOperatorEnum.Banglalink]: '019',
  [MobileOperatorEnum.Robi]: '018',
  [MobileOperatorEnum.Airtel]: '016',
  [MobileOperatorEnum.Teletalk]: '015',
  [MobileOperatorEnum.Other]: '',
};
