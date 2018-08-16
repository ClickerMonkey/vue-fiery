
import { init, link, destroy } from './mixin'
import { setGlobalOptions, define, mergeStrategy, mergeOptions } from './options'

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
