export interface IValidationStrategy {
  validate(): Promise<void>;
}
