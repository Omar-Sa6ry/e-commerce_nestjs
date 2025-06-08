import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { AppResolver } from './app.resolver'
import { ConfigModule } from './common/config/config.module'
import { TranslationModule } from './common/translation/translation.module'
import { GraphqlModule } from './common/graphql/graphql.module'
import { ThrottlerModule } from './common/throttler/throttling.module'
import { AuthModule } from './modules/auth/auth.module'
import { UserModule } from './modules/users/users.module'
import { PubSubModule } from './common/pubSub/pubsub.module'
import { DatabaseModule } from './common/database/database'

@Module({
  imports: [
    ConfigModule,
    GraphqlModule,
    DatabaseModule,
    PubSubModule,
    ThrottlerModule,
    TranslationModule,

    AuthModule,
    UserModule,
    ],

  providers: [AppService, AppResolver],
})
export class AppModule {}
