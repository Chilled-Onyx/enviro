/**
 * Collection of misc functions that don't really require their own files and
 * are complex enough to not be inlined.
 */

import Enviro from './types';

/**
 * Test if supplied value is an object
 * 
 * @param     testValue   mixed   Value to test
 * @returns   {boolean}
 */
export const isObject = (testValue: unknown): boolean =>
    !!(testValue && 
    typeof testValue === 'object' &&
    !Array.isArray(testValue));

/**
 * Deep object mreging
 * 
 * @param target object Target object to merge onto
 * @param source object Object to merge onto target
 * @returns { object }
 */
export const deepMerge = (target: {[key: string]: unknown}, source: {[key: string]: unknown}) => {
  const output = Object.assign({}, target);

  if(isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) Object.assign(output, { [key]: source[key] });
        else output[key] = deepMerge(target[key] as Enviro.KeyValueStore, source[key] as Enviro.KeyValueStore);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }

  return output;
}