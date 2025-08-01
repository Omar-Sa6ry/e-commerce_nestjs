import { I18nService } from "nestjs-i18n";
import { City } from "../entities/city.entity";
import { Country } from "../entities/country.entity";

export interface LocationValidator {
  setNext(validator: LocationValidator): LocationValidator;
  validate(
    entity: Country | City,
    i18n: I18nService,
    repository: any,
  ): Promise<void>;
}
