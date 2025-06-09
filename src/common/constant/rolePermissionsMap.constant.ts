import { Permission, Role } from './enum.constant';

export const rolePermissionsMap: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    Permission.UPDATE_USER,
    Permission.DELETE_USER,
    Permission.EDIT_USER_ROLE,
    Permission.RESET_PASSWORD,
    Permission.CHANGE_PASSWORD,
    Permission.FORGOT_PASSWORD,
    Permission.LOGOUT,

    // Company
    Permission.CREATE_COMPANY,
    Permission.UPDATE_COMPANY,
    Permission.DELETE_COMPANY,
    Permission.VIEW_COMPANY,
  ],

  [Role.MANAGER]: [
    Permission.UPDATE_USER,
    Permission.DELETE_USER,
    Permission.EDIT_USER_ROLE,
    Permission.RESET_PASSWORD,
    Permission.CHANGE_PASSWORD,
    Permission.LOGOUT,

    //
    Permission.CREATE_COMPANY,
    Permission.UPDATE_COMPANY,
    Permission.VIEW_COMPANY,
  ],

  [Role.USER]: [
    Permission.UPDATE_USER,
    Permission.RESET_PASSWORD,
    Permission.CHANGE_PASSWORD,
    Permission.FORGOT_PASSWORD,
    Permission.LOGOUT,

    Permission.VIEW_COMPANY,
  ],
  
  [Role.COMPANY]: [Permission.DELETE_EMPLOYEE, Permission.ADD_EMPLOYEE],
};
