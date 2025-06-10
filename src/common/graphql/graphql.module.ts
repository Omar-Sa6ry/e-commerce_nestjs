import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { HttpExceptionFilter } from '../filter/errorHandling.filter';

@Module({
  imports: [
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req }) => ({
        request: req,
        language: req.headers['accept-language'] || 'en',
      }),
      playground: true,
      uploads: true,
      debug: false,
      installSubscriptionHandlers: true,
      subscriptions: {
        'subscriptions-transport-ws': {
          path: '/graphql',
          keepAlive: 10000,
        },
        'graphql-ws': true,
      },
      formatError: (error) => {
        return {
          message: error.message,
          extensions: {
            ...error.extensions,
            stacktrace: undefined,
            locations: undefined,
            path: undefined,
          },
        };
      },
    }),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class GraphqlModule {}
