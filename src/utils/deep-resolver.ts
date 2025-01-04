/**
 * Recursively resolves all promises within an input structure (object, array, or single promise).
 * Preserves non-promise values and special types like Date without modifications.
 *
 * @param {any} input - The input to process, which can be a Promise, object, array, or other types.
 * @returns {Promise<any>} - A promise that resolves to the fully resolved structure.
 */
async function deepResolvePromises(input) {
  // If the input is a Promise, wait for its resolution and return the resolved value
  if (input instanceof Promise) {
    return await input;
  }

  // If the input is an array, resolve all its elements recursively
  if (Array.isArray(input)) {
    const resolvedArray = await Promise.all(input.map(deepResolvePromises));
    return resolvedArray;
  }

  // If the input is a Date object, return it as is (no promise resolution required)
  if (input instanceof Date) {
    return input;
  }

  // If the input is a non-null object, resolve all its properties recursively
  if (typeof input === 'object' && input !== null) {
    const keys = Object.keys(input); // Get all keys of the object
    const resolvedObject = {}; // Initialize an empty object to store resolved properties

    for (const key of keys) {
      // Recursively resolve each property value
      const resolvedValue = await deepResolvePromises(input[key]);
      resolvedObject[key] = resolvedValue;
    }

    return resolvedObject;
  }

  // For all other types (e.g., primitives like string, number, boolean), return the input as is
  return input;
}

export default deepResolvePromises;
