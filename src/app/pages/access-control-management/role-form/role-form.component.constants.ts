import { AccessControlModuleEnum, IPermissionGrant, PermissionActionEnum } from '@core/interfaces/recruitment-management/access-control.interface';

export const PermissionModules: AccessControlModuleEnum[] = [
  AccessControlModuleEnum.JobPostings,
  AccessControlModuleEnum.Applications,
  AccessControlModuleEnum.Interviews,
  AccessControlModuleEnum.Assessments,
  AccessControlModuleEnum.Reports,
  AccessControlModuleEnum.Admin,
];

export const PermissionActions: PermissionActionEnum[] = [
  PermissionActionEnum.View,
  PermissionActionEnum.Create,
  PermissionActionEnum.Edit,
  PermissionActionEnum.Delete,
  PermissionActionEnum.Approve,
];

export interface IPermissionMatrixRow {
  module: AccessControlModuleEnum;
  grants: Record<PermissionActionEnum, boolean>;
}

export function buildEmptyMatrix(): IPermissionMatrixRow[] {
  return PermissionModules.map((module) => ({
    module,
    grants: PermissionActions.reduce(
      (acc, action) => ({ ...acc, [action]: false }),
      {} as Record<PermissionActionEnum, boolean>,
    ),
  }));
}

export function buildFullMatrix(): IPermissionMatrixRow[] {
  return PermissionModules.map((module) => ({
    module,
    grants: PermissionActions.reduce(
      (acc, action) => ({ ...acc, [action]: true }),
      {} as Record<PermissionActionEnum, boolean>,
    ),
  }));
}

export function matrixFromGrants(grants: IPermissionGrant[]): IPermissionMatrixRow[] {
  const matrix = buildEmptyMatrix();
  for (const grant of grants) {
    const row = matrix.find((r) => r.module === grant.module);
    if (row) {
      row.grants[grant.action] = true;
    }
  }
  return matrix;
}

export function matrixToGrants(matrix: IPermissionMatrixRow[]): IPermissionGrant[] {
  const grants: IPermissionGrant[] = [];
  for (const row of matrix) {
    for (const action of PermissionActions) {
      if (row.grants[action]) {
        grants.push({ module: row.module, action });
      }
    }
  }
  return grants;
}
