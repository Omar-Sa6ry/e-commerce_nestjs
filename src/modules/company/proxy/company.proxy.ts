import { Repository } from "typeorm";
import { Company } from "../entity/company.entity";

export class CompanyRepositoryProxy {
  constructor(private readonly companyRepository: Repository<Company>) {}

  async findOneByName(name: string): Promise<Company | null> {
    return this.companyRepository.findOne({ where: { name } });
  }

  async findOneById(id: string): Promise<Company | null> {
    return this.companyRepository.findOne({ where: { id } });
  }

  async findAllPaginated(page: number, limit: number): Promise<Company[]> {
    return this.companyRepository.find({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }
}

