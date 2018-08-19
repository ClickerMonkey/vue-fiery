
import { FierySystem, FieryInstance, FieryOptionsInput, FieryTarget, FierySource } from './types'
import { forEach } from './util'
import { factory } from './factory'
import { getEntry, closeEntry } from './entry'
import { removeCacheFromInstance } from './cache'
import { globalOptions } from './options'
import * as operations from './operations'


export function getInstance (system: FierySystem): FieryInstance
{
  let targetFactory = (source: FierySource, options?: FieryOptionsInput, name?: string): FieryTarget => {
    return factory(getEntry(instance, source, options, name))
  }

  let instance: FieryInstance = targetFactory as FieryInstance

  instance.system = system
  instance.entry = {}
  instance.entryList = []
  instance.options = {}
  instance.sources = {}
  instance.cache = {}
  instance.update = operations.update
  instance.sync = operations.sync
  instance.remove = operations.remove
  instance.clear = operations.clear
  instance.getChanges = operations.getChanges
  instance.ref = operations.ref
  instance.create = operations.create
  instance.createSub = operations.createSub
  instance.build = operations.build
  instance.buildSub = operations.buildSub
  instance.destroy = destroy
  instance.free = free

  return instance as FieryInstance
}

function destroy(this: FieryInstance)
{
  forEach(this.options, opt => delete globalOptions.map[opt.id])
  forEach(this.cache, cached => removeCacheFromInstance(cached, this))
  forEach(this.entryList, entry => closeEntry(entry, true))

  this.entry = {}
  this.entryList = []
  this.options = {}
  this.sources = {}
  this.cache = {}
}

function free (this: FieryInstance, target: FieryTarget)
{
  forEach(this.entryList, entry => {
    if (entry.target === target) {
      closeEntry(entry, true)
    }
  })
}
