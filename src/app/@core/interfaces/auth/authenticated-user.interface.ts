import { UserRoleEnum } from '@core/enums/user-role.enum';

export interface IAuthenticatedUser {
  username: string;
  displayName: string;
  role: UserRoleEnum;
}
