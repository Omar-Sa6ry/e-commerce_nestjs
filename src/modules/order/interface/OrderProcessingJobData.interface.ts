import { PaymentMethod } from 'src/common/constant/enum.constant';
import { CartItem } from 'src/modules/cart/entities/cartItem.enitty';

export interface OrderProcessingJobData {
  userId: string;
  addressId: string;
  paymentMethod: PaymentMethod;
  delevaryPrice: number;
  couponId?: string;
  cartItems?: CartItem[];
  singleProduct?: {
    detailsId: string;
    quantity: number;
  };
}
