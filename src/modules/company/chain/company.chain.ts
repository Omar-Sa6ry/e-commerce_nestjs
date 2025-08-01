import { I18nService } from 'nestjs-i18n';
import { ICompanyHandler } from '../interfaces/ICompanyHandlet.interface';
import { Company } from '../entity/company.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

export class CompanyExistsHandler implements ICompanyHandler {
  private nextHandler: ICompanyHandler;
  private id: string;

  constructor(id: string) {
    this.id = id;
  }

  setNext(handler: ICompanyHandler): ICompanyHandler {
    this.nextHandler = handler;
    return handler;
  }

  async handle(company: Company | null, i18n: I18nService): Promise<void> {
    if (!company) {
      throw new NotFoundException(
        await i18n.t('company.NOT_FOUND', { args: { id: this.id } }),
      );
    }

    if (this.nextHandler) {
      await this.nextHandler.handle(company, i18n);
    }
  }
}

export class CompanyNameHandler implements ICompanyHandler {
  private nextHandler: ICompanyHandler;
  private name: string;
  private repository: Repository<Company>;

  constructor(name: string, repository: Repository<Company>) {
    this.name = name;
    this.repository = repository;
  }

  setNext(handler: ICompanyHandler): ICompanyHandler {
    this.nextHandler = handler;
    return handler;
  }

  async handle(company: Company | null, i18n: I18nService): Promise<void> {
    const existing = await this.repository.findOne({
      where: { name: this.name },
    });
    if (existing)
      throw new BadRequestException(
        await i18n.t('company.EXISTED', { args: { name: this.name } }),
      );

    if (this.nextHandler) await this.nextHandler.handle(company, i18n);
  }
}

export class CompanyEmailHandler implements ICompanyHandler {
  private nextHandler: ICompanyHandler;
  private email: string;
  private repository: Repository<Company>;

  constructor(email: string, repository: Repository<Company>) {
    this.email = email;
    this.repository = repository;
  }

  setNext(handler: ICompanyHandler): ICompanyHandler {
    this.nextHandler = handler;
    return handler;
  }

  async handle(company: Company | null, i18n: I18nService): Promise<void> {
    const existing = await this.repository.findOne({
      where: { email: this.email },
    });
    if (existing)
      throw new BadRequestException(
        await i18n.t('company.EXISTED', { args: { email: this.email } }),
      );

    if (this.nextHandler) await this.nextHandler.handle(company, i18n);
  }
}
