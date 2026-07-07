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
  roles?: UserRoleEnum[];
}
