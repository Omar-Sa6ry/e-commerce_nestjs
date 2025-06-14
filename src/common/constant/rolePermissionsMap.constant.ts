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

    // Location
    Permission.CREATE_COUNTRY,
    Permission.UPDATE_COUNTRY,
    Permission.DELETE_COUNTRY,
    Permission.CREATE_CITY,
    Permission.UPDATE_CITY,
    Permission.DELETE_CITY,

    // Company
    Permission.CREATE_COMPANY,
    Permission.UPDATE_COMPANY,
    Permission.DELETE_COMPANY,
    Permission.VIEW_COMPANY,

    // Category
    Permission.CREATE_CATEGORY,
    Permission.UPDATE_CATEGORY,
    Permission.DELETE_CATEGORY,

    // Color
    Permission.CREATE_COLOR,
    Permission.UPDATE_COLOR,
    Permission.DELETE_COLOR,
    Permission.VIEW_COLOR,

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

    // Order
    Permission.UPDATE_ORDER,
    Permission.DELETE_ORDER,
    Permission.VIEW_ALL_ORDERS,
    Permission.TRACK_ORDER_STATUS,
    Permission.ORDER_STATICTISC,
  ],

  [Role.USER]: [
    // User
    Permission.UPDATE_USER,
    Permission.RESET_PASSWORD,
    Permission.CHANGE_PASSWORD,
    Permission.FORGOT_PASSWORD,
    Permission.LOGOUT,

    // Addresss
    Permission.CREATE_ADDRESS,
    Permission.UPDATE_ADDRESS,
    Permission.DELETE_ADDRESS,
    Permission.VIEW_ADDRESS,
    Permission.DELETE_USER_ADDRESS,
    Permission.CREATE_USER_ADDRESS,
    Permission.UPDATE_USER_ADDRESS,

    // Company
    Permission.VIEW_COMPANY,

    // Coupon
    Permission.VIEW_COUPON,

    // Order
    Permission.CREATE_ORDER,
    Permission.VIEW_ORDER_ITEM,

    // Color
    Permission.VIEW_COLOR,

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
