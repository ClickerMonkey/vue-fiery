

import { FieryOptions, FierySource } from './types'


export function isObject (x?: any): boolean
{
  return Object.prototype.toString.call(x) === '[object Object]'
}

export function isFunction (x?: any): boolean
{
  return typeof x === 'function'
}

export function isArray (x?: any): boolean
{
  return x && x instanceof Array
}

export function isArraySource (source: FierySource, options: FieryOptions): boolean
{
  return !!((<any>source).where && !options.map)
}
