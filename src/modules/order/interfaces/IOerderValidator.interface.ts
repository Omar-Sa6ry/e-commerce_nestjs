export interface IOrderValidator {
  setNext(handler: IOrderValidator): IOrderValidator;
  handle(request: any): Promise<void>;
}
