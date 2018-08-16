

import { FieryOptions, FieryInstance, FieryTarget, FieryEntry, FierySources, FieryVue, FierySource, FieryData, FieryChangesCallback, FieryEquality, FieryFields } from './types'
import { isCollectionSource } from './util'
import { getOptions } from './options'
import * as operations from './operations'


export function closeEntry (entry: FieryEntry): void
{
  if (entry && entry.off)
  {
    entry.off()

    delete entry.off
  }
}

export function getEntry (vm: FieryVue, source: FierySource, optionsInput?: string | Partial<FieryOptions>, entryKeyInput?: string, useRawOptions: boolean = false)
{
  const options: FieryOptions = useRawOptions
    ? optionsInput as FieryOptions
    : getOptions(optionsInput, vm)
  const target: FieryTarget = isCollectionSource(source)
    ? options.newCollection()
    : options.newDocument()
  const recordFunctions = getEntryRecordFunctions(vm)
  const property: string | undefined = options.property
  const entryKey: string = entryKeyInput || property || ''
  const fiery: FieryInstance = vm.$fiery
  const fires: FierySources = vm.$fires

  let existing: FieryEntry | undefined = fiery.entry[ entryKey ]
  let children = {}
  let entry: FieryEntry = { source, options, target, children, recordFunctions }

  if (existing)
  {
    closeEntry(existing)

    entry.target = existing.target
  }

  if (!entryKey || !(entryKey in fiery.entry))
  {
    entry.index = fiery.entryList.length

    fiery.entryList.push(entry)
  }

  if (entryKey)
  {
    fiery.entry[ entryKey ] = entry
  }

  if (property)
  {
    fires[ property ] = source
  }

  return entry
}

export function getEntryRecordFunctions (vm: FieryVue)
{
  return {
    sync: function(this: FieryData, fields?: FieryFields) {
      return operations.sync.call(vm, this, fields)
    },
    update: function(this: FieryData, fields?: FieryFields) {
      return operations.update.call(vm, this, fields)
    },
    remove: function(this: FieryData, excludeSubs: boolean = false) {
      return operations.remove.call(vm, this, excludeSubs)
    },
    ref: function(this: FieryData, sub?: string) {
      return operations.ref.call(vm, this, sub)
    },
    clear: function(this: FieryData, props: FieryFields) {
      return operations.clear.call(vm, this, props)
    },
    getChanges: function(this: FieryData,
      fieldsOrCallback: FieryFields | FieryChangesCallback,
      callbackOrEquality?: FieryChangesCallback | FieryEquality,
      equalityOrNothing?: FieryEquality) {
      return operations.getChanges.call(vm, this, fieldsOrCallback, callbackOrEquality, equalityOrNothing)
    }
  }
}
