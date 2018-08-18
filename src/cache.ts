
import * as firebase from 'firebase'



import { UID_SEPARATOR, PROP_UID } from './constants'
import { FieryInstance, FieryEntry, FieryCacheEntry, FieryCache, FieryData, FieryOptions, FieryOptionsMap, FieryEntryMap } from './types'
import { closeEntry } from './entry'
import { addSubs } from './data'




type DocumentReference = firebase.firestore.DocumentReference
type DocumentSnapshot = firebase.firestore.DocumentSnapshot



export const globalCache: FieryCache = { }


export function getCacheForReference (entry: FieryEntry, ref: DocumentReference): FieryCacheEntry
{
  const uid = entry.storeKey + UID_SEPARATOR + ref.path

  if (uid in globalCache)
  {
    addCacheToEntry(globalCache[uid], entry)

    return globalCache[uid]
  }

  const data = entry.options.newDocument()

  data[PROP_UID] = uid

  const cache: FieryCacheEntry = {
    uid,
    data,
    uses: 0,
    sub: {},
    firstEntry: entry,
    entries: [],
    removed: false
  }

  globalCache[uid] = cache

  if (!(cache.uid in entry.instance.cache))
  {
    entry.instance.cache[cache.uid] = cache
    cache.uses++
  }

  addCacheToEntry(cache, entry)

  return cache
}

export function getCacheForDocument (entry: FieryEntry, doc: DocumentSnapshot): FieryCacheEntry
{
  return getCacheForReference(entry, doc.ref)
}

export function getCacheForData (data: FieryData): FieryCacheEntry | undefined
{
  return globalCache[data[PROP_UID]]
}

export function removeDataFromEntry (entry: FieryEntry, data: FieryData): void
{
  removeCacheFromEntry(entry, getCacheForData(data))
}

export function removeCacheFromEntry (entry: FieryEntry, cache?: FieryCacheEntry): void
{
  if (cache && cache.uid in entry.children)
  {
    const options: FieryOptions = entry.options
    const entries: FieryEntry[] = cache.entries

    // remove reference to entry from cache
    const entryIndex = entries.indexOf(entry)
    if (entryIndex !== -1)
    {
      entries.splice(entryIndex, 1)
    }

    // remove cache reference from entry
    delete entry.children[cache.uid]

    // if no entries, destroy cache
    if (entries.length === 0)
    {
      destroyCache(cache)
    }
    else
    {
      // if no more entries for this instance, remove from instance
      let inInstance: boolean = false

      for (var i = 0; i < entries.length; i++)
      {
        if (entries[i].instance === entry.instance)
        {
          inInstance = true
          break
        }
      }

      if (!inInstance)
      {
        removeCacheFromInstance(cache, entry.instance)
      }

      // turn off any unneeded subs
      for (var sub in cache.sub)
      {
        if (!isReferencedSub(cache, sub))
        {
          closeEntry(cache.sub[sub], true)
        }
      }
    }
  }
}

export function isReferencedSub (cache: FieryCacheEntry, sub: string): boolean
{
  const entries: FieryEntry[] = cache.entries
  const subs: FieryEntryMap = cache.sub

  for (var i = 0; i < entries.length; i++)
  {
    const entry: FieryEntry = entries[i]
    const entrySubs: FieryOptionsMap | undefined = entry.options.sub

    if (entrySubs && sub in entrySubs)
    {
      return true
    }
  }

  return false
}

export function addCacheToEntry (cache: FieryCacheEntry, entry: FieryEntry): void
{
  if (!(cache.uid in entry.children))
  {
    cache.entries.push(entry)
    entry.children[cache.uid] = cache

    addSubs(cache, entry)
  }
}

export function removeCacheFromInstance (cache: FieryCacheEntry, instance: FieryInstance, checkForDestroy: boolean = true): void
{
  if (cache.uid in instance.cache)
  {
    cache.uses--
    delete instance.cache[cache.uid]

    const entries: FieryEntry[] = cache.entries

    for (let i = entries.length - 1; i >= 0; i--)
    {
      const entry = entries[i]

      if (entry.instance === instance)
      {
        removeCacheFromEntry(entry, cache)
      }
    }

    if (checkForDestroy && cache.uses <= 0)
    {
      destroyCache(cache)
    }
  }
}

export function destroyCache (cache: FieryCacheEntry): void
{
  const entries: FieryEntry[] = cache.entries

  for (let i = 0; i < entries.length; i++)
  {
    removeCacheFromInstance(cache, entries[i].instance, false)
  }

  for (var sub in cache.sub)
  {
    closeEntry(cache.sub[sub], true)
  }

  if (cache.uses <= 0 && !cache.removed)
  {
    delete globalCache[cache.uid]
    delete cache.doc
    delete cache.sub
    delete cache.data

    cache.entries.length = 0
    cache.removed = true
  }
}
