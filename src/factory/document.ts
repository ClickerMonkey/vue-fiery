
import * as firebase from 'firebase'


import { FierySystem, FieryOptions, FieryEntry, FieryData, FieryCacheEntry, FieryTarget } from '../types'
import { refreshData } from '../data'
import { getCacheForReference, removeCacheFromEntry, destroyCache } from '../cache'



type DocumentSnapshot = firebase.firestore.DocumentSnapshot
type DocumentChange = firebase.firestore.DocumentChange
type DocumentReference = firebase.firestore.DocumentReference
type DocumentListenOptions = firebase.firestore.DocumentListenOptions



type OnSnapshot = (querySnapshot: DocumentSnapshot) => any



export function factory (entry: FieryEntry): FieryData
{
  const source: DocumentReference = entry.source as DocumentReference
  const options: FieryOptions = entry.options
  const cache: FieryCacheEntry = getCacheForReference(entry, source)
  const initialTarget: FieryTarget | undefined = entry.target

  const onSnapshot = (doc: DocumentSnapshot) => {
    handleDocumentUpdate(cache, entry, doc)
  }

  if (options.once)
  {
    entry.promise = source.get(options.onceOptions)
      .then(onSnapshot)
      .catch(options.onError)
  }
  else
  {
    entry.off = source.onSnapshot(
      options.liveOptions as DocumentListenOptions,
      onSnapshot,
      options.onError
    )
  }

  if (initialTarget && initialTarget !== cache.data)
  {
    removeCacheFromEntry(entry, cache)
  }

  entry.target = cache.data

  return entry.target as FieryData
}

export function handleDocumentUpdate (cache: FieryCacheEntry, entry: FieryEntry, doc: DocumentSnapshot): void
{
  const options: FieryOptions = entry.options
  const system: FierySystem = entry.instance.system

  if (!doc.exists)
  {
    destroyCache(cache)

    if (entry.name)
    {
      system.removeNamed(entry.name)
    }
  }
  else
  {
    refreshData(cache, doc, entry)

    options.onSuccess(cache.data)
  }
}

export default factory
