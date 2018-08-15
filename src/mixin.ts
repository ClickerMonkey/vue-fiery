

import { FieryVue, FieryInstance, FieryInstanceFactory, FieryTarget, FierySource, FieryOptions, FieryEntry } from './types'
import { getMetadata } from './util'
import { getEntry, closeEntry } from './entry'
import * as operations from './operations'
import { factoryInstance } from './factory'



export function init (this: FieryVue): void
{
  this.$fiery = factoryInstance(this) as FieryInstance
  this.$fiery.stores = {}
  this.$fiery.storeKeyNext = 0
  this.$fiery.storeIdToKey = {}
  this.$fiery.options = {}
  this.$fiery.optionKeyNext = 0
  this.$fiery.entry = {}
  this.$fiery.entryList = []
  this.$fiery.update = operations.update.bind(this)
  this.$fiery.sync = operations.sync.bind(this)
  this.$fiery.remove = operations.remove.bind(this)
  this.$fiery.clear = operations.clear.bind(this)
  this.$fiery.getChanges = operations.getChanges.bind(this)
  this.$fiery.ref = operations.ref.bind(this)
  this.$fiery.link = link.bind(this)
  this.$fiery.destroy = destroy.bind(this)
  this.$fiery.getMetadata = (data) => getMetadata(this, data)
  this.$fires = {}
}

export function destroy (this: FieryVue): void
{
  this.$fiery.stores = {}
  this.$fiery.entry = {}
  this.$fiery.entryList.forEach(closeEntry)
  this.$fiery.entryList = []
  this.$fiery = <any>(() => {}) as FieryInstance
  this.$fires = {}
}

export function link (this: FieryVue): void
{
  const entryList: (FieryEntry | null)[] = this.$fiery.entryList

  for (let i = 0; i < entryList.length; i++)
  {
    const entry: FieryEntry | null = entryList[i]

    if (entry === null)
    {
      continue
    }

    const options: FieryOptions = entry.options

    if (!options.parent && !options.property)
    {
      for (let prop in this)
      {
        if (this[prop] === entry.target)
        {
          options.property = prop

          this.$fiery.entry[ prop ] = entry
          this.$fires[ prop ] = entry.source

          break
        }
      }
    }
  }
}
