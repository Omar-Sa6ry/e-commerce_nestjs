import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { HttpExceptionFilter } from '../filter/errorHandling.filter';
import depthLimit from 'graphql-depth-limit';
// import {
//   createComplexityRule as queryComplexity,
//   fieldExtensionsEstimator,
//   simpleEstimator,
// } from 'graphql-query-complexity';


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

      // Subscription
      installSubscriptionHandlers: true,
      subscriptions: {
        'subscriptions-transport-ws': {
          path: '/graphql',
          keepAlive: 10000,
        },
        'graphql-ws': true,
      },

      // // SQL Injection
      // validationRules: [
      //   depthLimit(5),
      //   queryComplexity({
      //     estimators: [
      //       fieldExtensionsEstimator(),
      //       simpleEstimator({ defaultComplexity: 1 }),
      //     ],
      //     maximumComplexity: 1000,
      //   }),
      // ],

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
