import * as DataLoader from 'dataloader';
import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Category } from '../../category/entity/category.entity';
import { Company } from '../../company/entity/company.entity';
import { User } from '../../users/entity/user.entity';
import { Image } from '../entities/image.entity';
import { Details } from '../../poductDetails/entity/productDetails.entity';

@Injectable()
export class ProductDataLoader {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    @InjectRepository(Details)
    private readonly detailsRepository: Repository<Details>,
  ) {}

  public readonly batchCategories = new DataLoader<string, Category>(
    async (categoryIds: string[]) => {
      const categories = await this.categoryRepository.find({
        where: { id: In(categoryIds) },
      });

      return categoryIds.map((id) =>
        categories.find((category) => category.id === id),
      );
    },
  );

  public readonly batchCompanies = new DataLoader<string, Company>(
    async (companyIds: string[]) => {
      const companies = await this.companyRepository.find({
        where: { id: In(companyIds) },
      });

      return companyIds.map((id) =>
        companies.find((company) => company.id === id),
      );
    },
  );

  public readonly batchUsers = new DataLoader<string, User>(
    async (userIds: string[]) => {
      const users = await this.userRepository.find({
        where: { id: In(userIds) },
      });

      return userIds.map((id) => users.find((user) => user.id === id));
    },
  );

  public readonly batchImages = new DataLoader<string, Image[]>(
    async (productIds: string[]) => {
      const images = await this.imageRepository.find({
        where: { productId: In(productIds) },
      });

      return productIds.map((id) =>
        images.filter((image) => image.productId === id),
      );
    },
  );

  public readonly batchDetails = new DataLoader<string, Details[]>(
    async (productIds: string[]) => {
      const details = await this.detailsRepository.find({
        where: { productId: In(productIds) },
      });
      
      return productIds.map((id) =>
        details.filter((detail) => detail.productId === id),
      );
    },
  );
}
