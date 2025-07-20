import { Repository } from 'typeorm';
import { ICompanyValidator } from '../interfaces/ICompany.interface';
import { I18nService } from 'nestjs-i18n';
import { Company } from '../entity/company.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

export class CompanyValidatorAdapter implements ICompanyValidator {
  constructor(
    private readonly companyRepository: Repository<Company>,
    private readonly i18n: I18nService,
  ) {}

  async validateNotExistsByEmail(email: string): Promise<void> {
    const company = await this.companyRepository.findOne({ where: { email } });
    if (company) {
      throw new BadRequestException(
        await this.i18n.t('company.EXISTED', { args: { email } }),
      );
    }
  }

  async validateNotExistsByName(name: string): Promise<void> {
    const company = await this.companyRepository.findOne({ where: { name } });
    if (company) {
      throw new BadRequestException(
        await this.i18n.t('company.EXISTED', { args: { name } }),
      );
    }
  }

  async validateExists(id: string): Promise<Company> {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) {
      throw new NotFoundException(
        await this.i18n.t('company.NOT_FOUND', { args: { id } }),
      );
    }
    return company;
  }
}
