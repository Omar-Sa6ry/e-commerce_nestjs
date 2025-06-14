import { Injectable, BadRequestException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PaymentStatus } from 'src/common/constant/enum.constant';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private readonly i18n: I18nService) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key not configured');
    }
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  async handleStripePayment(
    userId: string,
    orderId: string,
    email: string,
    items: { name: string; price: number; quantity: number }[],
  ): Promise<string> {
    try {
      if (!items || items.length === 0)
        throw new BadRequestException(await this.i18n.t('order.NO_ITEMS'));

      const lineItems = await Promise.all(
        items.map(async (item) => {
          if (item.price <= 0 || item.quantity <= 0) {
            throw new BadRequestException(
              await this.i18n.t('order.INVALID_ITEM'),
            );
          }

          return {
            price_data: {
              currency: 'egp',
              product_data: {
                name: item.name,
              },
              unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
          };
        }),
      );

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.SUCCESSURL}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FAILURL}?session_id={CHECKOUT_SESSION_ID}`,
        client_reference_id: userId,
        customer_email: email,
        metadata: {
          orderId: orderId,
          userId: userId,
        },
      });

      return session.url;
    } catch (error) {
      const errorMessage =
        error.raw?.message ||
        error.message ||
        (await this.i18n.t('order.STRIPE_ERROR'));
      throw new BadRequestException(errorMessage);
    }
  }

  async verifyPayment(sessionId: string): Promise<boolean> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      return session.payment_status === PaymentStatus.PAID;
    } catch (error) {
      return false;
    }
  }

  async constructEventFromPayload(
    signature: string,
    payload: Buffer,
  ): Promise<Stripe.Event> {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  }
}
