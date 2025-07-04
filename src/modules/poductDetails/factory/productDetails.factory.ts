import { Injectable } from '@nestjs/common';
import { Details } from '../entity/productDetails.entity';
import { CreateDetailInput } from '../inputs/createProductDetails.input';

@Injectable()
export class ProductDetailsFactory {
  static create(input: CreateDetailInput): Details {
    const detail = new Details();
    Object.assign(detail, input);
    return detail;
  }
}
