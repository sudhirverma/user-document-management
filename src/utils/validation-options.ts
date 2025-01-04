import {
  HttpStatus,
  UnprocessableEntityException,
  type ValidationError,
  type ValidationPipeOptions,
} from '@nestjs/common';

/**
 * Recursively generates a structured error object from an array of ValidationErrors.
 * Handles nested validation errors by traversing `children` and compiling constraints.
 *
 * @param {ValidationError[]} errors - The array of validation errors to process.
 * @returns {Record<string, unknown>} - A nested object containing validation error messages.
 */
function generateErrors(errors: ValidationError[]): Record<string, unknown> {
  return errors.reduce(
    (accumulator, currentValue) => ({
      // Spread the current accumulated errors
      // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
      ...accumulator,
      [currentValue.property]:
        // If there are child validation errors, process them recursively
        (currentValue.children?.length ?? 0) > 0
          ? generateErrors(currentValue.children ?? [])
          : // Otherwise, join all constraint messages into a single string
            Object.values(currentValue.constraints ?? {}).join(', '),
    }),
    {}, // Initial value for the accumulator
  );
}

/**
 * Configuration for the NestJS ValidationPipe, defining behavior for validation and error handling.
 */
const validationOptions: ValidationPipeOptions = {
  transform: true, // Automatically transform input payloads to match DTO types.
  whitelist: true, // Remove properties that are not explicitly defined in the DTO.
  errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY, // Use HTTP 422 for validation errors.
  exceptionFactory: (errors: ValidationError[]) => {
    // Custom exception factory to format validation errors
    return new UnprocessableEntityException({
      status: HttpStatus.UNPROCESSABLE_ENTITY, // Set HTTP status in the error response
      errors: generateErrors(errors), // Structure validation errors using the helper function
    });
  },
};

export default validationOptions;
