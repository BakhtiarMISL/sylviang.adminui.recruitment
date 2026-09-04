import { UserRoleEnum } from '@core/enums/user-role.enum';

export interface IMenuItem {
  key?: string;
  title: string;
  href?: string;
  icon: string;
  flags?: string[];
  subItems?: IMenuItem[];
  active: boolean;
  expanded?: boolean;
  order?: number;
  divider?: boolean;
  /** Non-clickable section heading rendered above a cluster of sub-items (e.g. "Admin Only") -
   * when present the item itself renders as a small uppercase label, not a menu link. */
  label?: string;
  roles?: UserRoleEnum[];
}
