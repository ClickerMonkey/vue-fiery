
import { PROP_UID, PROP_VALUE, RECORD_OPTIONS } from './constants'
import { FieryOptionsInput, FieryOptions, FieryOptionsMap, FieryInstance, FieryExclusions, FierySource, FieryData, FieryMap, FieryChangesCallback, FieryEquality, FieryMergeStrategy, FieryMergeStrategies } from './types'
import { isObject, isFunction, isArray, coalesce, forEach, isDefined } from './util'
import * as operations from './operations'



export const globalOptions =
{
  defined: {} as FieryOptionsMap,

  user: undefined as Partial<FieryOptions> | undefined,

  defaults:
  {
    onError: (message: any) => {},

    onMissing: () => {},

    onSuccess: (results: any) => {},

    onRemove: () => {},

    liveOptions: {},

    propValue: PROP_VALUE,

    recordOptions: RECORD_OPTIONS,

    newDocument: (encoded?: FieryData) => ({} as FieryData)

  } as Partial<FieryOptions>,

  id: 0,

  map: {} as FieryOptionsMap
}


export function getOptionsByKey (key: string): FieryOptions
{
  return globalOptions.map[parseInt(key)] as FieryOptions
}

export function getOptions (options?: FieryOptionsInput, instance?: FieryInstance): FieryOptions
{
  // If a string is passed - returned a defined option.
  if (typeof options === 'string')
  {
    if (!(options in globalOptions.defined))
    {
      throw 'The definition ' + options + ' was not found. You must call define before you use the definition'
    }

    // Ensure the defined option is properly populated
    return getOptions(globalOptions.defined[options])
  }

  // If nothing was given, populate an empty set of options
  if (!options || !isObject(options))
  {
    options = {}
  }

  // If the options was already populated, return the options
  if (options.id && options.id in globalOptions.map)
  {
    return options as FieryOptions
  }
  // Otherwise, assign this options an id and add it to the list of options
  else if (!options.id)
  {
    options.id = ++globalOptions.id
    globalOptions.map[options.id] = options as FieryOptions
  }

  if (options.extends)
  {
    performMerge(options, getOptions(options.extends))
  }

  performMerge(options, globalOptions.user)
  performMerge(options, globalOptions.defaults)

  if (instance && !options.shared)
  {
    options.instance = instance
    instance.options[ options.id ] = options as FieryOptions
  }

  if (options.type)
  {
    const typeConstructor = options.type

    options.newDocument = (encoded?: FieryData) => (new typeConstructor() as FieryData)
  }

  if (!options.newCollection)
  {
    options.newCollection = options.map
      ? () => ({} as FieryMap)
      : () => ([] as FieryData[])
  }

  let excludeMap: FieryExclusions = {}

  if (!options.exclude)
  {
    if (options.key)
    {
      excludeMap[options.key] = true
    }
  }
  else if (isArray(options.exclude))
  {
    forEach(options.exclude, (value, key) => excludeMap[value] = true)
  }
  else
  {
    excludeMap = options.exclude as FieryExclusions
  }

  excludeMap[options.propValue as string] = true
  excludeMap[PROP_UID] = true

  forEach(options.recordOptions, (value, key) => excludeMap[value] = true)

  options.exclude = excludeMap

  if (options.sub)
  {
    for (let subProp in options.sub)
    {
      let subOptionsInput = options.sub[subProp] as Partial<FieryOptions>
      let subOptions = getOptions(subOptionsInput, instance)

      subOptions.parent = options as FieryOptions

      options.sub[subProp] = subOptions
      excludeMap[subProp] = true
    }
  }

  return options as FieryOptions
}

export function recycleOptions (options: FieryOptions)
{
  const instance: FieryInstance | undefined = options.instance

  if (instance)
  {
    delete instance.options[options.id]
  }
}

export function define (nameOrMap: string | FieryOptionsMap, namedOptions?: Partial<FieryOptions>): void
{
  if (typeof nameOrMap === 'string')
  {
    const options: Partial<FieryOptions> = namedOptions as Partial<FieryOptions>

    options.shared = true

    globalOptions.defined[nameOrMap] = options
  }
  else
  {
    for (let name in nameOrMap)
    {
      const options: Partial<FieryOptions> = nameOrMap[name]

      options.shared = true

      globalOptions.defined[name] = options
    }
  }
}

export function setGlobalOptions (user?: Partial<FieryOptions>): void
{
  if (user)
  {
    user.shared = true
  }

  globalOptions.user = user
}

export function performMerge (options: Partial<FieryOptions>, defaults?: Partial<FieryOptions>): void
{
  if (!defaults) return

  for (let prop in mergeOptions)
  {
    const optionsProp = prop as keyof FieryOptions
    const merger: FieryMergeStrategy = mergeOptions[optionsProp]

    options[optionsProp] = merger( options[optionsProp], defaults[optionsProp] )
  }
}

export const mergeStrategy: FieryMergeStrategies =
{
  ignore (options: any, defaults: any): any {
    return options
  },
  replace (options: any, defaults: any): any {
    return coalesce(options, defaults)
  },
  chain (options: any, defaults: any): any {
    if (!isDefined(defaults)) return options
    if (!isDefined(options)) return defaults

    return function(this: any) {
      (defaults as Function).apply(this, arguments)
      (options as Function).apply(this, arguments)
    }
  },
  shallow (options: any, defaults: any): any {
    if (!isDefined(defaults)) return options
    if (!isDefined(options)) return defaults

    return {
      ...defaults,
      ...options
    }
  },
  concat (options: any, defaults: any): any {
    if (!isDefined(defaults)) return options
    if (!isDefined(options)) return defaults

    if (isArray(options) && isArray(defaults)) {
      let union = options.concat(defaults)
      let added: {[k:string]:any} = {}
      for (let i = union.length - 1; i >= 0; i--) {
        if (union[i] in added) {
          union.splice(i, 1)
        } else {
          added[union[i]] = true
        }
      }
      return union
    }
  },
  exclude (options: any, defaults: any): any {
    const union = mergeStrategy.concat(options, defaults)
    if (!union && options && defaults) {
      let exclusions: {[k:string]:any} = {}
      let defaultsArray = isArray(defaults)
      let optionsArray = isArray(options)
      forEach(defaults, (value, key) => value ? (exclusions[defaultsArray ? value : key] = true) : 0)
      forEach(options, (value, key) => value ? (exclusions[optionsArray ? value : key] = true) : 0)
      return exclusions
    }
    return union
  }
}

export const mergeOptions: FieryMergeStrategies =
{
  extends:            mergeStrategy.ignore,
  id:                 mergeStrategy.ignore,
  parent:             mergeStrategy.ignore,
  shared:             mergeStrategy.ignore,
  vm:                 mergeStrategy.ignore,
  key:                mergeStrategy.replace,
  query:              mergeStrategy.replace,
  map:                mergeStrategy.replace,
  once:               mergeStrategy.replace,
  type:               mergeStrategy.replace,
  newDocument:        mergeStrategy.replace,
  newCollection:      mergeStrategy.replace,
  decode:             mergeStrategy.replace,
  decoders:           mergeStrategy.shallow,
  encoders:           mergeStrategy.shallow,
  record:             mergeStrategy.replace,
  recordOptions:      mergeStrategy.replace,
  recordFunctions:    mergeStrategy.replace,
  propValue:          mergeStrategy.replace,
  onceOptions:        mergeStrategy.replace,
  liveOptions:        mergeStrategy.replace,
  include:            mergeStrategy.concat,
  exclude:            mergeStrategy.exclude,
  onError:            mergeStrategy.replace,
  onSuccess:          mergeStrategy.replace,
  onMissing:          mergeStrategy.replace,
  onRemove:           mergeStrategy.replace,
  sub:                mergeStrategy.shallow
}
