"use strict";
/**
 * Collection of misc functions that don't really require their own files and
 * are complex enough to not be inlined.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepMerge = exports.isObject = void 0;
/**
 * Test if supplied value is an object
 *
 * @param     testValue   mixed   Value to test
 * @returns   {boolean}
 */
const isObject = (testValue) => !!(testValue &&
    typeof testValue === 'object' &&
    !Array.isArray(testValue));
exports.isObject = isObject;
/**
 * Deep object mreging
 *
 * @param target object Target object to merge onto
 * @param source object Object to merge onto target
 * @returns { object }
 */
const deepMerge = (target, source) => {
    const output = Object.assign({}, target);
    if ((0, exports.isObject)(target) && (0, exports.isObject)(source)) {
        Object.keys(source).forEach(key => {
            if ((0, exports.isObject)(source[key])) {
                if (!(key in target))
                    Object.assign(output, { [key]: source[key] });
                else
                    output[key] = (0, exports.deepMerge)(target[key], source[key]);
            }
            else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
};
exports.deepMerge = deepMerge;
