import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Company } from '../entity/company.entity';
import { CreateCompanyDto } from '../inputs/createCompany.input';
import { I18nService } from 'nestjs-i18n';
import { UpdateCompanyDto } from '../inputs/updateCompany.input';
import { AddressService } from 'src/modules/address/address.service';
import { CreateAddressInput } from 'src/modules/address/inputs/createAddress.dto';
import {
  CompanyEmailHandler,
  CompanyExistsHandler,
  CompanyNameHandler,
} from '../chain/company.chain';

@Injectable()
export class CompanyFacade {
  constructor(
    private readonly companyRepository: Repository<Company>,
    private readonly addressService: AddressService,
    private readonly i18n: I18nService,
  ) {}

  async createCompany(
    createDto: CreateCompanyDto,
    createAddressInput?: CreateAddressInput,
  ): Promise<Company> {
    const emailHandler = new CompanyEmailHandler(
      createDto.email,
      this.companyRepository,
    );
    const nameHandler = new CompanyNameHandler(
      createDto.name,
      this.companyRepository,
    );
    emailHandler.setNext(nameHandler);
    await emailHandler.handle(null, this.i18n);

    const company = this.companyRepository.create(createDto);

    if (createAddressInput) {
      const address =
        await this.addressService.createAddress(createAddressInput);
      company.addressId = address.data.id;
      company.address = address.data;
    }

    return this.companyRepository.save(company);
  }

  async updateCompany(
    id: string,
    updateDto: UpdateCompanyDto,
  ): Promise<Company> {
    const company = await this.companyRepository.findOne({ where: { id } });

    const existsHandler = new CompanyExistsHandler(id);
    await existsHandler.handle(company, this.i18n);

    Object.assign(company, updateDto);
    return this.companyRepository.save(company);
  }
}
