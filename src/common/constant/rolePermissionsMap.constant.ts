import { Permission, Role } from './enum.constant';

export const rolePermissionsMap: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    // User
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

    // Category
    Permission.CREATE_CATEGORY,
    Permission.UPDATE_CATEGORY,
    Permission.DELETE_CATEGORY,
  ],

  [Role.MANAGER]: [
    // User
    Permission.UPDATE_USER,
    Permission.DELETE_USER,
    Permission.EDIT_USER_ROLE,
    Permission.RESET_PASSWORD,
    Permission.CHANGE_PASSWORD,
    Permission.LOGOUT,

    // Company
    Permission.CREATE_COMPANY,
    Permission.UPDATE_COMPANY,
    Permission.VIEW_COMPANY,

    ,
  ],

  [Role.USER]: [
    // User
    Permission.UPDATE_USER,
    Permission.RESET_PASSWORD,
    Permission.CHANGE_PASSWORD,
    Permission.FORGOT_PASSWORD,
    Permission.LOGOUT,

    // Company
    Permission.VIEW_COMPANY,

    ,
  ],

  [Role.COMPANY]: [
    // Employee
    Permission.DELETE_EMPLOYEE,
    Permission.ADD_EMPLOYEE,

    ,
  ],
};
