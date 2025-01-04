import {
  Injectable,
  type NestInterceptor,
  type ExecutionContext,
  type CallHandler,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import deepResolvePromises from './deep-resolver';

/**
 * An interceptor that deeply resolves promises in the response data.
 * This ensures that any nested promises within the returned data structure are resolved
 * before the data is sent to the client.
 */
@Injectable()
export class ResolvePromisesInterceptor implements NestInterceptor {
  /**
   * Intercepts a request/response cycle to process the response data.
   *
   * @param {ExecutionContext} context - The context of the current request being handled.
   * @param {CallHandler} next - A handler for proceeding with the request.
   * @returns {Observable<unknown>} - An observable that resolves to the processed response data.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // Use the RxJS `map` operator to process the observable stream of response data
    return next.handle().pipe(
      map((data) => {
        // Apply the deepResolvePromises function to resolve any nested promises in the data
        return deepResolvePromises(data);
      }),
    );
  }
}
