export enum AccessControlModuleEnum {
  JobPostings = 'JobPostings',
  Applications = 'Applications',
  Interviews = 'Interviews',
  Assessments = 'Assessments',
  Reports = 'Reports',
  Admin = 'Admin',
}

export enum PermissionActionEnum {
  View = 'View',
  Create = 'Create',
  Edit = 'Edit',
  Delete = 'Delete',
  Approve = 'Approve',
}

export interface IPermissionGrant {
  module: AccessControlModuleEnum;
  action: PermissionActionEnum;
}

export interface IRoleResponse {
  roleId: number;
  name: string;
  isSystemRole: boolean;
  permissions: IPermissionGrant[];
}

export interface IRoleCreateRequest {
  name: string;
  permissions: IPermissionGrant[];
}

export interface IRoleUpdateRequest extends IRoleCreateRequest {}

export interface IUserAccountResponse {
  userAccountId: number;
  email: string;
  fullName: string;
  isActive: boolean;
  roleIds: number[];
  roleNames: string[];
  companyId: number | null;
  companyName: string | null;
}

export interface IUserAccountCreateRequest {
  email: string;
  fullName: string;
  roleIds: number[];
  companyId?: number | null;
}

export interface IUserAccountUpdateRequest {
  fullName: string;
  roleIds: number[];
}
