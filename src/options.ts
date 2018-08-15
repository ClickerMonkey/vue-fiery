


import { PROP_UID, PROP_VALUE, RECORD_OPTIONS } from './constants'
import { FieryOptions, FieryInstance, FieryVue, FieryExclusions, FierySource, FieryData, FieryMap } from './types'
import { isObject, isFunction, isArray } from './util'
import * as operations from './operations'



export function normalizeOptions(vm: FieryVue, options?: Partial<FieryOptions>, source?: FierySource): FieryOptions
{
  if (!options || !isObject(options))
  {
    options = {}
  }

  if (!isFunction(options.onError))
  {
    options.onError = (message) => {}
  }

  if (!isFunction(options.onMissing))
  {
    options.onMissing = () => {}
  }

  if (!isFunction(options.onSuccess))
  {
    options.onSuccess = (results) => {}
  }

  if (!isFunction(options.onRemove))
  {
    options.onRemove = () => {}
  }

  if (!options.liveOptions)
  {
    options.liveOptions = {}
  }

  if (!options.propValue)
  {
    options.propValue = PROP_VALUE
  }

  if (!options.recordOptions)
  {
    options.recordOptions = RECORD_OPTIONS
  }

  if (options.record)
  {
    options.recordFunctions = {
      sync: function(this: FieryData, fields?: string[]) {
        return operations.sync.call(vm, this, fields)
      },
      update: function(this: FieryData, fields?: string[]) {
        return operations.update.call(vm, this, fields)
      },
      remove: function(this: FieryData, excludeSubs: boolean = false) {
        return operations.remove.call(vm, this, excludeSubs)
      },
      ref: function(this: FieryData, sub?: string) {
        return operations.ref.call(vm, this, sub)
      }
    }
  }

  if (options.type)
  {
    let typeConstructor = options.type

    options.newDocument = (encoded?: FieryData) => (new typeConstructor() as FieryData)
  }
  else if (!options.newDocument)
  {
    options.newDocument = (encoded?: FieryData) => ({} as FieryData)
  }

  if (!options.newCollection)
  {
    options.newCollection = options.map
      ? () => ({} as FieryMap)
      : () => ([] as FieryData[])
  }

  if (!options.exclude)
  {
    options.exclude = {}

    if (options.key)
    {
      options.exclude[options.key] = true
    }
  }
  else if (isArray(options.exclude))
  {
    let excludeArray = options.exclude as string[]

    options.exclude = {}

    for (let i = 0; i < excludeArray.length; i++)
    {
      options.exclude[excludeArray[i]] = true
    }
  }

  let excludeMap: FieryExclusions = options.exclude as FieryExclusions

  excludeMap[options.propValue] = true
  excludeMap[PROP_UID] = true

  for (let recordOperation in options.recordOptions)
  {
    excludeMap[options.recordOptions[recordOperation]] = true
  }

  if (options.sub)
  {
    for (let subProp in options.sub)
    {
      let subOptions = normalizeOptions(vm, options.sub[subProp] as Partial<FieryOptions>)

      subOptions.property = subProp
      subOptions.parent = options as FieryOptions

      options.sub[subProp] = subOptions
      excludeMap[subProp] = true
    }
  }

  if (!options.id)
  {
    const fiery: FieryInstance = vm.$fiery

    options.id = ++fiery.optionKeyNext

    fiery.options[options.id] = options as FieryOptions
  }

  return options as FieryOptions
}
