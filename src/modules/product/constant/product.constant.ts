import { CreateProductInput } from '../inputs/createProduct.input';
import { UpdateProductInput } from '../inputs/updateProduct.input';

export type ProductAction = 'create' | 'update' | 'delete';
export type ProductInput = CreateProductInput | UpdateProductInput | string;
