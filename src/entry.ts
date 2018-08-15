

import { isCollectionSource } from './util'
import { normalizeOptions } from './options'
import { FieryOptions, FieryInstance, FieryTarget, FieryEntry, FierySources, FieryVue, FierySource } from './types'


export function closeEntry(entry: FieryEntry): void
{
  if (entry && entry.off)
  {
    entry.off()

    delete entry.off
  }
}

export function getEntry(vm: FieryVue, source: FierySource, optionsInput?: Partial<FieryOptions>, entryKeyInput?: string, useRawOptions: boolean = false)
{
  const options: FieryOptions = useRawOptions
    ? optionsInput as FieryOptions
    : normalizeOptions(vm, optionsInput, source)
  const property: string | undefined = options.property
  const entryKey: string = entryKeyInput || property || ''
  const fiery: FieryInstance = vm.$fiery
  const fires: FierySources = vm.$fires
  const target: FieryTarget = isCollectionSource(source) ? options.newCollection() : options.newDocument()

  let existing: FieryEntry | undefined = fiery.entry[ entryKey ]
  let children = {}
  let entry: FieryEntry = { source, options, target, children }

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
