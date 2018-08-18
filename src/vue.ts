
import { FieryInstance, FieryOptions, FieryEntry, FierySources } from './types'
import { setGlobalOptions, define, mergeStrategy, mergeOptions } from './options'
import { getInstance } from './instance'

export interface FieryVue
{
  $fiery: FieryInstance

  $fires: FierySources

  // Vue properties & functions

  [prop: string]: any

  $delete: (object: any, key: string | number) => any

  $set: (object: any, key: string | number, value?: any) => any
}

export function init (this: FieryVue): void
{
  this.$fiery = getInstance({
    removeNamed: (name: string) => {
      this[name] = null
    },
    setProperty: (target: any, property: string, value: any) => {
      this.$set(target, property, value)
    },
    removeProperty: (target: any, property: string) => {
      this.$delete(target, property)
    },
    arrayInsert: (target: any[], index: number, value: any) => {
      target.splice(index, 0, value)
    },
    arrayRemove: (target: any[], index: number) => {
      target.splice(index, 1)
    },
    arrayMove: (target: any[], fromIndex: number, toIndex: number, value: any) => {
      target.splice(fromIndex, 1)
      target.splice(toIndex, 0, value)
    },
    arraySet: (target: any[], index: number, value: any) => {
      target.splice(index, 1, value)
    },
    arrayAdd: (target: any[], value: any) => {
      target.push(value)
    },
    arrayClear: (target: any[]) => {
      target.splice(0, target.length)
    }
  })

  this.$fires = this.$fiery.sources
}

export function destroy (this: FieryVue): void
{
  this.$fiery.destroy()
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

    if (!options.parent && !entry.name)
    {
      for (let prop in this)
      {
        if (this[prop] === entry.target)
        {
          entry.name = prop

          this.$fiery.entry[ prop ] = entry
          this.$fires[ prop ] = entry.source

          break
        }
      }
    }
  }
}

export const plugin =
{
  mergeOptions,

  mergeStrategy,

  define,

  setGlobalOptions,

  install (Vue: any)
  {
    Vue.mixin({
      beforeCreate: init,
      created: link,
      beforeDestroy: destroy
    })
  }
}

if (typeof window !== 'undefined' && (<any>window).Vue)
{
  (<any>window).Vue.use(plugin)
}

export default plugin
