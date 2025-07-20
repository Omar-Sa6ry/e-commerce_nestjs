import { Category } from "../entity/category.entity";

export interface ICategoryValidator {
  validateExists(name: string): Promise<void>;
  validateNotExists(id: string): Promise<Category>;
}
