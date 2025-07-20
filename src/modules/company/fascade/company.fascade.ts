import { Repository } from 'typeorm';
import { ICompanyValidator } from '../interfaces/ICompany.interface';
import { Company } from '../entity/company.entity';
import { AddressService } from 'src/modules/address/address.service';
import { CreateCompanyDto } from '../inputs/createCompany.input';
import { CreateAddressInput } from 'src/modules/address/inputs/createAddress.dto';
import { UpdateCompanyDto } from '../inputs/updateCompany.input';

export class CompanyFacade {
  constructor(
    private readonly validator: ICompanyValidator,
    private readonly companyRepository: Repository<Company>,
    private readonly addressService: AddressService,
  ) {}

  async createCompany(
    createDto: CreateCompanyDto,
    createAddressInput?: CreateAddressInput,
  ): Promise<Company> {
    await this.validator.validateNotExistsByEmail(createDto.email);
    await this.validator.validateNotExistsByName(createDto.name);

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
    const company = await this.validator.validateExists(id);
    Object.assign(company, updateDto);
    return this.companyRepository.save(company);
  }
}


