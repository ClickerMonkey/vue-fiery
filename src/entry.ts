

import { FierySystem, FieryOptionsInput, FieryEntryMap, FieryOptions, FieryInstance, FieryEntry, FierySources, FierySource, FieryCache, FieryData, FieryChangesCallback, FieryEquality, FieryFields } from './types'
import { isCollectionSource, forEach } from './util'
import { getOptions, recycleOptions } from './options'
import { getStoreKey } from './store'
import { removeCacheFromEntry } from './cache'
import * as operations from './operations'


export function closeEntry (entry: FieryEntry, removeChildren: boolean = false): void
{
  if (entry && entry.live)
  {
    if (entry.off)
    {
      entry.off()

      delete entry.off
    }

    entry.live = false

    if (removeChildren)
    {
      forEach(entry.children, cached =>
      {
        removeCacheFromEntry(entry, cached)
      })
    }
  }
}

export function getEntry (instance: FieryInstance, source: FierySource, optionsInput?: FieryOptionsInput, name?: string, namedSource: boolean = true)
{
  // Things that are allowed to change on repetitive entry calls
  const options: FieryOptions = getOptions(optionsInput, instance)
  const storeKey: number = getStoreKey(source)

  if (name && name in instance.entry)
  {
    const existing: FieryEntry = instance.entry[ name ]

    closeEntry(existing)

    if (options.id !== existing.options.id)
    {
      recycleOptions(existing.options)
    }

    existing.source = source
    existing.options = options
    existing.storeKey = storeKey
    existing.live = true

    return existing
  }

  const recordFunctions = getEntryRecordFunctions(instance)
  const children: FieryCache = {}
  const live: boolean = true
  const entry: FieryEntry = {
    name,
    options,
    source,
    instance,
    storeKey,
    children,
    recordFunctions,
    live
  }

  if (!name || !(name in instance.entry))
  {
    entry.index = instance.entryList.length

    instance.entryList.push(entry)
  }

  if (name)
  {
    instance.entry[ name ] = entry
  }

  if (name && namedSource)
  {
    instance.sources[ name ] = source
  }

  return entry
}

export function getEntryRecordFunctions (instance: FieryInstance)
{
  return {
    sync: function(this: FieryData, fields?: FieryFields) {
      return operations.sync.call(instance, this, fields)
    },
    update: function(this: FieryData, fields?: FieryFields) {
      return operations.update.call(instance, this, fields)
    },
    remove: function(this: FieryData, excludeSubs: boolean = false) {
      return operations.remove.call(instance, this, excludeSubs)
    },
    ref: function(this: FieryData, sub?: string) {
      return operations.ref.call(instance, this, sub)
    },
    clear: function(this: FieryData, props: FieryFields) {
      return operations.clear.call(instance, this, props)
    },
    build: function(this: FieryData, sub: string, initial?: FieryData) {
      return operations.buildSub.call(instance, this, sub, initial)
    },
    create: function(this: FieryData, sub: string, initial?: FieryData) {
      return operations.createSub.call(instance, this, sub, initial)
    },
    getChanges: function(this: FieryData,
      fieldsOrCallback: FieryFields | FieryChangesCallback,
      callbackOrEquality?: FieryChangesCallback | FieryEquality,
      equalityOrNothing?: FieryEquality) {
      return operations.getChanges.call(instance, this, fieldsOrCallback, callbackOrEquality, equalityOrNothing)
    }
  }
}
