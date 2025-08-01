import { StripeService } from 'src/modules/stripe/stripe.service';
import { IPaymentStrategy } from '../interfaces/IPaymentStrategy.interface';

export class StripePaymentStrategy implements IPaymentStrategy {
  constructor(private stripeService: StripeService) {}

  async processPayment(
    userId: string,
    orderId: string,
    email: string,
    items: { name: string; price: number; quantity: number }[],
  ): Promise<string> {
    return this.stripeService.handleStripePayment(
      userId,
      orderId,
      email,
      items,
    );
  }
}


