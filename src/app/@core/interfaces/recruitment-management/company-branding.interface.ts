export type DocumentBorderStyle = 'None' | 'Solid' | 'Double' | 'Rounded';

export interface ICompanyBrandingResponse {
  logoFilePath: string | null;
  companyName: string | null;
  addressLine: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  fontFamily: string | null;
  borderStyle: DocumentBorderStyle;
  backgroundWatermarkEnabled: boolean;
  watermarkOpacity: number;
  showPageNumbers: boolean;
}

// Company identity/contact (name/address/phone/email/website) is no longer editable here -
// it's sourced live from Company (edited via Company Management) so the two never drift.
export interface ICompanyBrandingUpdateRequest {
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  fontFamily: string | null;
  borderStyle: DocumentBorderStyle;
  backgroundWatermarkEnabled: boolean;
  watermarkOpacity: number;
  showPageNumbers: boolean;
}
