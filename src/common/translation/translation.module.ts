import { Module } from '@nestjs/common'
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n'
import * as path from 'path'

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(process.cwd(), 'src/common/translation/locales/'),
        watch: true,
      },
      resolvers: [new HeaderResolver(['x-lang']), new AcceptLanguageResolver()],
    }),
  ],
  exports: [I18nModule],
})
export class TranslationModule {}
