
import * as firebase from 'firebase'



import { STORE_SEPARATOR } from './constants'
import { FierySource } from './types'



type Firestore = firebase.firestore.Firestore



export const stores = {

  keyNext: 0,

  map: { } as { [storeKey: number]: Firestore },

  idToKey: { } as { [id: string]: number }

}

export function getStoreKey (source: FierySource): number
{
  const firestore: Firestore = source.firestore
  const id: string = firestore.app.name
  let key: number = stores.idToKey[id]

  if (!key)
  {
    key = ++stores.keyNext
    stores.map[key] = firestore
    stores.idToKey[id] = key
  }

  return key
}
