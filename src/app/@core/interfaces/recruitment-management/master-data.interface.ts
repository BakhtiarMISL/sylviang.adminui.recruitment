export type MasterDataFieldType = 'text' | 'number';

export interface IMasterDataFieldConfig {
  key: string;
  label: string;
  type: MasterDataFieldType;
  required?: boolean;
  maxLength?: number;
  /** Regex source (no slashes/flags) applied as a Validators.pattern. */
  pattern?: string;
  patternMessage?: string;
  placeholder?: string;
}

export interface IMasterDataEntityConfig {
  /** URL segment under this feature's route, e.g. 'country-list'. */
  routeKey: string;
  /** Backend route segment under /recruitment, e.g. 'country'. */
  apiPath: string;
  /** Response/request id property name, e.g. 'countryId'. */
  idField: string;
  title: string;
  singularLabel: string;
  icon: string;
  fields: IMasterDataFieldConfig[];
}

export interface IMasterDataItem {
  [key: string]: string | number | null | undefined;
}
