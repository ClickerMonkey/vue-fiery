
import * as firebase from 'firebase'



import { PROP_UID } from '../constants'
import { FieryVue, FieryEntry, FieryTarget, FieryData, FieryOptions, FieryMap } from '../types'
import { refreshDocument, destroyDocuments, destroyDocument } from '../documents'



type Query = firebase.firestore.Query
type QuerySnapshot = firebase.firestore.QuerySnapshot
type DocumentSnapshot = firebase.firestore.DocumentSnapshot
type DocumentChange = firebase.firestore.DocumentChange
type CollectionReference = firebase.firestore.CollectionReference
type QueryListenOptions = firebase.firestore.QueryListenOptions



function factory (vm: FieryVue, entry: FieryEntry): FieryMap
{
  type CollectionQuery = CollectionReference | Query
  const options: FieryOptions = entry.options
  const query: CollectionQuery = (options.query ? options.query(entry.source) : entry.source) as CollectionQuery

  if (options.once)
  {
    entry.promise = query.get(options.onceOptions)
      .then((querySnapshot: QuerySnapshot) =>
      {
        const target: FieryMap = entry.target as FieryMap

        let missing: FieryMap = {}
        for (let id in target) {
          missing[id] = target[id]
        }

        querySnapshot.forEach((doc: DocumentSnapshot) =>
        {
          const old: FieryData = target[doc.id]
          const updated: FieryData = refreshDocument(vm, entry, doc, old)

          vm.$set(target, doc.id, updated)
          delete missing[doc.id]

        }, options.onError)

        destroyDocuments(vm, missing, target)

        options.onSuccess(target)

      }).catch(options.onError)
  }
  else
  {
    entry.off = query.onSnapshot(options.liveOptions as QueryListenOptions,
      (querySnapshot: QuerySnapshot) =>
      {
        const target: FieryMap = entry.target as FieryMap

        (<any>querySnapshot).docChanges().forEach((change: DocumentChange) =>
        {
          const doc: DocumentSnapshot = change.doc

          switch (change.type) {
            case 'modified':
            case 'added':
              const old: FieryData = target[doc.id]
              const updated: FieryData = refreshDocument(vm, entry, doc, old)
              vm.$set(target, doc.id, updated)
              break
            case 'removed':
              destroyDocument(vm, target[doc.id])
              vm.$delete(target, doc.id)
              break
          }
        }, options.onError)

        options.onSuccess(target)

      }, options.onError)
  }

  return entry.target as FieryMap
}

export default factory
