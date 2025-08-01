import { I18nService } from "nestjs-i18n";
import { CompanyFacade } from "../fascade/company.fascade";
import { CreateCompanyDto } from "../inputs/createCompany.input";
import { CreateAddressInput } from "src/modules/address/inputs/createAddress.dto";
import { ICompanyCommand } from "../interfaces/ICompanyCommand.interface";
import { CompanyResponse } from "../dto/companyResponse.dto";
import { UpdateCompanyDto } from "../inputs/updateCompany.input";

export class CreateCompanyCommand implements ICompanyCommand {
  constructor(
    private readonly facade: CompanyFacade,
    private readonly input: CreateCompanyDto,
    private readonly i18n: I18nService,
    private readonly createAddressInput?: CreateAddressInput,
  ) {}

  async execute(): Promise<CompanyResponse> {
    const company = await this.facade.createCompany(
      this.input,
      this.createAddressInput,
    );
    return {
      data: company,
      statusCode: 201,
      message: await this.i18n.t('company.CREATED', {
        args: { name: this.input.name },
      }),
    };
  }
}

export class UpdateCompanyCommand implements ICompanyCommand {
  constructor(
    private readonly facade: CompanyFacade,
    private readonly id: string,
    private readonly input: UpdateCompanyDto,
    private readonly i18n: I18nService,
  ) {}

  async execute(): Promise<CompanyResponse> {
    const company = await this.facade.updateCompany(this.id, this.input);
    return {
      data: company,
      message: await this.i18n.t('company.UPDATED', { args: { id: this.id } }),
    };
  }
}
