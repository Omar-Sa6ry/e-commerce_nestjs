import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { GraphQLError } from 'graphql';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GeneralResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const gqlCtx = GqlExecutionContext.create(context);
    const operation = gqlCtx.getInfo()?.operation?.operation;

    if (operation === 'subscription') {
      return next.handle();
    }

    return next.handle().pipe(
      map((data: any) => {
        // Ensure safety before accessing arrays
        const isArray = Array.isArray(data);
        const items = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.data?.items)
            ? data.data.items
            : [];

        return {
          success: true,
          statusCode: data?.statusCode || 200,
          message: data?.message || 'Request successful',
          timeStamp: new Date().toISOString().split('T')[0],
          pagination: data?.pagination,
          url: data?.url,
          items,
          data: isArray
            ? data
            : typeof data?.data === 'object'
              ? data.data
              : {},
        };
      }),

      catchError((error) => {
        return throwError(
          () =>
            new GraphQLError(error.message || 'An error occurred', {
              extensions: {
                success: false,
                statusCode: error?.response?.statusCode || error?.status || 500,
                message:
                  error?.errors?.map((err: any) => err?.message) ||
                  error?.response?.message ||
                  error?.extensions?.message ||
                  'An error occurred',
                timeStamp: new Date().toISOString().split('T')[0],
                error: error?.response?.error || 'Unknown error',
              },
            }),
        );
      }),
    );
  }
}
