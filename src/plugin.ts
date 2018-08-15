
import { init, link, destroy } from './mixin'



export function install(Vue: any)
{
  Vue.mixin({
    beforeCreate: init,
    created: link,
    beforeDestroy: destroy
  })
}

if (typeof window !== 'undefined' && (<any>window).Vue)
{
  (<any>window).Vue.use(install)
}

export default install
