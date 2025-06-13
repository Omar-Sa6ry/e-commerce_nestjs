import { registerEnumType } from '@nestjs/graphql';

export enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  COMPANY = 'company',
}
export const AllRoles: Role[] = Object.values(Role);

export enum OrderStatus {
  PENDING = 'pending',
  SHIPPED = 'shipped',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
}

export enum PaymentMethod {
  STRIPE = 'stripe',
  CASH_ON_DELIVERY = 'cash_on_delivery',
}

export enum TypeCoupon {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
}

export enum AddressType {
  HOME = 'home',
  WORK = 'work',
  BILLING = 'billing',
  SHIPPING = 'shipping',
  OTHER = 'other',
}

export enum Size {
  SMALL = 'small',
  XSMALL = 'x small',
  MEDIUM = 'medium',
  LARGE = 'large',
  XLARGE = 'x large',
}

export enum QueuesNames {
  ORDER_PROCESSING = 'order_processing',
}

export enum Permission {
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',
  EDIT_USER_ROLE = 'edit_user_role',

  RESET_PASSWORD = 'RESET_PASSWORD',
  CHANGE_PASSWORD = 'CHANGE_PASSWORD',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
  LOGOUT = 'LOGOUT',

  // Location
  CREATE_COUNTRY = 'create_country',
  UPDATE_COUNTRY = 'update_country',
  DELETE_COUNTRY = 'delete_country',

  CREATE_CITY = 'create_city',
  UPDATE_CITY = 'update_city',
  DELETE_CITY = 'delete_city',

  // Address
  CREATE_ADDRESS = 'create_address',
  UPDATE_ADDRESS = 'update_address',
  DELETE_ADDRESS = 'delete_address',
  VIEW_ADDRESS = 'view_address',

  // User Address
  CREATE_USER_ADDRESS = 'create_user_address',
  UPDATE_USER_ADDRESS = 'update_user_address',
  DELETE_USER_ADDRESS = 'delete_user_address',

  // Company
  CREATE_COMPANY = 'create_company',
  UPDATE_COMPANY = 'update_company',
  DELETE_COMPANY = 'delete_company',
  VIEW_COMPANY = 'view_company',
  ADD_EMPLOYEE = 'add_employee',
  DELETE_EMPLOYEE = 'delete_employee',

  // Category
  CREATE_CATEGORY = 'create_category',
  UPDATE_CATEGORY = 'update_category',
  DELETE_CATEGORY = 'delete_category',

  // Product
  CREATE_PRODUCT = 'create_product',
  UPDATE_PRODUCT = 'update_product',
  DELETE_PRODUCT = 'delete_product',

  // Product Details
  CREATE_PRODUCT_DETAILS = 'create_product_details',
  UPDATE_PRODUCT_DETAILS = 'update_product_details',
  DELETE_PRODUCT_DETAILS = 'delete_product_details',

  // Cart
  CREATE_CART = 'create_cart',
  UPDATE_CART = 'update_cart',
  DELETE_CART = 'delete_cart',
  VIEW_CART = 'view_cart',

  // Coupon
  CREATE_COUPON = 'create_coupon',
  UPDATE_COUPON = 'update_coupon',
  DELETE_COUPON = 'delete_coupon',
  VIEW_COUPON = 'view_coupon',
  COUPON_ACTIVE = 'coupon_active',

  // Order
  CREATE_ORDER = 'create_order',
  UPDATE_ORDER = 'update_order',
  DELETE_ORDER = 'delete_order',
  VIEW_ALL_ORDERS = 'view_all_orders',
  VIEW_ORDER_ITEM = 'view_order_item',
  TRACK_ORDER_STATUS = 'track_order_status',
  ORDER_STATICTISC = 'order_statistics',
}

registerEnumType(Permission, {
  name: 'Permission',
  description: 'Detailed permissions in the system',
});

registerEnumType(Role, {
  name: 'Role',
  description: 'User roles in the system',
});

registerEnumType(PaymentStatus, {
  name: 'PaymentStatus',
  description: 'Detailed Payment Status in the system',
});

registerEnumType(Size, {
  name: 'Size',
  description: 'Detailed Product Size in the system',
});

registerEnumType(TypeCoupon, {
  name: 'TypeCoupon',
  description: 'Types of Coupons in the system',
});

registerEnumType(OrderStatus, {
  name: 'OrderStatus',
  description: 'Detailed Order Status in the system',
});

registerEnumType(PaymentMethod, {
  name: 'PaymentMethod',
  description: 'Detailed Payment Method in the system',
});

registerEnumType(AddressType, {
  name: 'AddressType',
  description: 'Detailed Address Type in the system',
});
