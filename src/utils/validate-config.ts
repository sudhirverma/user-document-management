import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import type { ClassConstructor } from 'class-transformer/types/interfaces';

/**
 * Validates configuration data by transforming it into a class instance and running validation rules.
 *
 * @template T - The type of the class to validate against.
 * @param {Record<string, unknown>} config - The configuration object to validate (e.g., environment variables).
 * @param {ClassConstructor<T>} envVariablesClass - The class that defines validation rules for the configuration.
 * @returns {T} - The validated and transformed configuration object.
 * @throws {Error} - Throws an error if validation fails.
 */
function validateConfig<T extends object>(
  config: Record<string, unknown>, // The raw configuration object, typically loaded from environment variables.
  envVariablesClass: ClassConstructor<T>, // The class with validation decorators for the config properties.
): T {
  // Convert the plain configuration object into an instance of the specified class.
  const validatedConfig = plainToClass(envVariablesClass, config, {
    enableImplicitConversion: true, // Automatically converts types where possible (e.g., string to number).
  });

  // Perform synchronous validation on the transformed object.
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false, // Ensures all properties defined in the class are validated, even if missing.
  });

  // If there are validation errors, throw an error with the validation details.
  if (errors.length > 0) {
    throw new Error(errors.toString()); // Convert validation errors into a readable string.
  }

  // Return the validated and transformed configuration object.
  return validatedConfig;
}

export default validateConfig;
