
import * as firebase from 'firebase'


import { PROP_UID } from '../constants'
import { FieryVue, FieryEntry, FieryTarget, FieryData, FieryOptions, FieryMap } from '../types'
import { refreshDocument, destroyDocuments } from '../documents'



type Query = firebase.firestore.Query
type QuerySnapshot = firebase.firestore.QuerySnapshot
type DocumentSnapshot = firebase.firestore.DocumentSnapshot
type DocumentChange = firebase.firestore.DocumentChange
type CollectionReference = firebase.firestore.CollectionReference
type QueryListenOptions = firebase.firestore.QueryListenOptions



export function factory (vm: FieryVue, entry: FieryEntry): FieryData[]
{
  type CollectionQuery = CollectionReference | Query
  const options: FieryOptions = entry.options
  const query: CollectionQuery = (options.query ? options.query(entry.source) : entry.source) as CollectionQuery

  if (options.once)
  {
    entry.promise = query.get(options.onceOptions)
      .then((querySnapshot: QuerySnapshot) =>
      {
        const target: FieryData[] = entry.target as FieryData[]

        const missing: FieryMap = {}

        for (let i = 0; i < target.length; i++)
        {
          const old: FieryData = target[i]
          missing[old[PROP_UID]] = old
        }

        target.splice(0, target.length);

        querySnapshot.forEach((doc: DocumentSnapshot) =>
        {
          const old = missing[doc.id]
          const updated = refreshDocument(vm, entry, doc, old)

          target.push(updated)
          delete missing[updated[PROP_UID]]

        }, options.onError)

        destroyDocuments(vm, missing)

        options.onSuccess(target)

      }).catch(options.onError)
  }
  else
  {
    entry.off = query.onSnapshot(options.liveOptions as QueryListenOptions,
      (querySnapshot: QuerySnapshot) =>
      {
        const target: FieryData[] = entry.target as FieryData[]

        (<any>querySnapshot).docChanges().forEach((change: DocumentChange) =>
        {
          const doc: DocumentSnapshot = change.doc

          switch (change.type) {
            case 'added':
              const created: FieryData = refreshDocument(vm, entry, doc)
              target.splice(change.newIndex, 0, created)
              break
            case 'removed':
              target.splice(change.oldIndex, 1)
              break
            case 'modified':
              const old: FieryData = target[change.oldIndex]
              const updated: FieryData = refreshDocument(vm, entry, doc, old)

              if (change.oldIndex !== change.newIndex) {
                target.splice(change.oldIndex, 1)
                target.splice(change.newIndex, 0, updated)
              } else {
                target.splice(change.newIndex, 1, updated)
              }
              break
          }
        }, options.onError)

        options.onSuccess(target)

      }, options.onError)
  }

  return entry.target as FieryData[]
}

export default factory
