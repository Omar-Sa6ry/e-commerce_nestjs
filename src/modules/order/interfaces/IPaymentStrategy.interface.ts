export interface IPaymentStrategy {
  processPayment(
    userId: string,
    orderId: string,
    email: string,
    items: { name: string; price: number; quantity: number }[],
  ): Promise<string>;
}