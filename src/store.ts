
import * as firebase from 'firebase'



import { STORE_SEPARATOR } from './constants'
import { FieryVue, FieryInstance } from './types'



type Firestore = firebase.firestore.Firestore
type DocumentSnapshot = firebase.firestore.DocumentSnapshot



export const stores = {

  keyNext: 0,

  map: { } as { [storeKey: number]: Firestore },

  idToKey: { } as { [id: string]: number }

}

export function getStoreByKey (key: string): Firestore
{
  return stores.map[parseInt(key)]
}

export function getStoreKey (doc: DocumentSnapshot): number
{
  const firestore = (<any>doc)._firestore
  const db = firestore._databaseId
  const id: string = db.database + STORE_SEPARATOR + db.projectId

  let key: number = stores.idToKey[id]

  if (!key)
  {
    key = ++stores.keyNext
    stores.map[key] = firestore
    stores.idToKey[id] = key
  }

  return key
}
