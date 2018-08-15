
import * as firebase from 'firebase'


import { FieryOptions, FieryEntry, FieryData, FieryVue } from '../types'
import { refreshDocument } from '../documents'



type DocumentSnapshot = firebase.firestore.DocumentSnapshot
type DocumentChange = firebase.firestore.DocumentChange
type DocumentReference = firebase.firestore.DocumentReference
type DocumentListenOptions = firebase.firestore.DocumentListenOptions



export function factory (vm: FieryVue, entry: FieryEntry): FieryData
{
  const source: DocumentReference = entry.source as DocumentReference
  const options: FieryOptions = entry.options

  if (options.once)
  {
    entry.promise = source.get(options.onceOptions)
      .then((doc: DocumentSnapshot) =>
      {
        handleDocumentUpdate(vm, entry, doc)

      }).catch(options.onError)
  }
  else
  {
    entry.off = source.onSnapshot(options.liveOptions as DocumentListenOptions,
      (doc: DocumentSnapshot) =>
      {
        handleDocumentUpdate(vm, entry, doc)

      }, options.onError)
  }

  return entry.target as FieryData
}

export function handleDocumentUpdate(vm: FieryVue, entry: FieryEntry, doc: DocumentSnapshot): void
{
  const options: FieryOptions = entry.options

  if (!doc.exists)
  {
    options.onMissing()
  }
  else
  {
    entry.target = refreshDocument(vm, entry, doc, entry.target)

    if (options.reset && options.property)
    {
      vm[options.property] = entry.target
    }

    options.onSuccess(entry.target)
  }
}

export default factory
