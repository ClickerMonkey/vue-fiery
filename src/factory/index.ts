

import { FieryVue, FieryEntry, FieryTarget, FierySource, FieryInstanceFactory, FieryOptions } from '../types'
import { getEntry } from '../entry'



import factoryDocument from './document'
import factoryMap from './map'
import factoryCollection from './collection'



export function factory (vm: FieryVue, entry: FieryEntry): FieryTarget
{
  let chosenFactory = (<any>entry.source).where
    ? (entry.options.map ? factoryMap : factoryCollection)
    : factoryDocument

  return chosenFactory(vm, entry)
}

export function factoryInstance (vm: FieryVue): FieryInstanceFactory
{
  return (source: FierySource, options?: string | Partial<FieryOptions>): FieryTarget => {
    return factory(vm, getEntry(vm, source, options))
  }
}

export default factory
