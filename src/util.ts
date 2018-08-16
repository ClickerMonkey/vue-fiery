
import * as firebase from 'firebase'


import { PROP_UID, UID_SEPARATOR } from './constants'
import { FieryOptions, FierySource, FieryVue, FieryData, FieryMetadata, FieryEntry, FieryFields } from './types'


type Firestore = firebase.firestore.Firestore



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

export function isDefined (x?: any): boolean
{
  return typeof x !== 'undefined'
}

export function coalesce (a?: any, b?: any): any
{
  return isDefined(a) ? a : b
}

export function isCollectionSource (source: FierySource): boolean
{
  return !!((<any>source).where)
}

export function getFields (fields?: FieryFields, otherwise?: string[]): string[] | undefined
{
  return !fields ? otherwise : (typeof fields === 'string' ? [fields] : fields)
}

export function forEach (iterable: any, callback: (item: any, key?: number | string, iterable?: any) => any): boolean
{
  if (isArray(iterable))
  {
    for (let i = 0; i < iterable.length; i++)
    {
      callback(iterable[i], i, iterable)
    }

    return true
  }
  else if (isObject(iterable))
  {
    for (let prop in iterable)
    {
      callback(iterable[prop], prop, iterable)
    }

    return true
  }

  return false
}

export function getMetadata (vm: FieryVue, data: FieryData): FieryMetadata
{
  const uid: string = data[PROP_UID]
  const [storeKey, optionKey, path] = uid.split(UID_SEPARATOR) as string[]
  const store: Firestore = vm.$fiery.stores[parseInt(storeKey)]
  const options: FieryOptions = vm.$fiery.options[parseInt(optionKey)]

  return { uid, path, storeKey, store, optionKey, options }
}

export function createRecord (data: FieryData, entry: FieryEntry): FieryData
{
  const options: FieryOptions = entry.options

  if (options.record)
  {
    let recordOptions = options.recordOptions
    let recordFunctions = entry.recordFunctions

    if (recordOptions.sync) data[recordOptions.sync] = recordFunctions.sync
    if (recordOptions.update) data[recordOptions.update] = recordFunctions.update
    if (recordOptions.remove) data[recordOptions.remove] = recordFunctions.remove
    if (recordOptions.clear) data[recordOptions.clear] = recordFunctions.clear
    if (recordOptions.getChanges) data[recordOptions.getChanges] = recordFunctions.getChanges
    if (recordOptions.ref) data[recordOptions.ref] = recordFunctions.ref
  }

  return data
}

export function isEqual (a: any, b: any): boolean
{
  if (a === b)
  {
    return true
  }

  if (!a || !b)
  {
    return false
  }

  if (isArray(a) && isArray(b))
  {
    if (a.length !== b.length)
    {
      return false
    }

    for (let i = 0; i < a.length; i++)
    {
      if (!isEqual(a[i], b[i]))
      {
        return false
      }
    }

    return true
  }

  if (isObject(a) && isObject(b))
  {
    for (let prop in a)
    {
      if (!isEqual(a[prop], b[prop]))
      {
        return false
      }
    }

    for (let prop in b)
    {
      if (!(prop in a))
      {
        return false
      }
    }

    return true
  }

  return false
}
