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

    // Cart
    Permission.CREATE_CART,
    Permission.UPDATE_CART,
    Permission.DELETE_CART,
    Permission.VIEW_CART,

    // Coupon
    Permission.CREATE_COUPON,
    Permission.UPDATE_COUPON,
    Permission.DELETE_COUPON,
    Permission.VIEW_COUPON,
    Permission.COUPON_ACTIVE,
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

    // Cart
    Permission.CREATE_CART,
    Permission.UPDATE_CART,
    Permission.DELETE_CART,
    Permission.VIEW_CART,
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

    // Coupon
    Permission.VIEW_COUPON,

    // Cart
    Permission.CREATE_CART,
    Permission.UPDATE_CART,
    Permission.DELETE_CART,
    Permission.VIEW_CART,
  ],

  [Role.COMPANY]: [
    // Employee
    Permission.DELETE_EMPLOYEE,
    Permission.ADD_EMPLOYEE,

    // Product
    Permission.CREATE_PRODUCT,
    Permission.UPDATE_PRODUCT,
    Permission.DELETE_PRODUCT,

    // Product Details
    Permission.CREATE_PRODUCT_DETAILS,
    Permission.UPDATE_PRODUCT_DETAILS,
    Permission.DELETE_PRODUCT_DETAILS,

    // Cart
    Permission.VIEW_CART,
  ],
};
