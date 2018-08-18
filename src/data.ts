
import * as firebase from 'firebase'



import { ENTRY_SEPARATOR } from './constants'
import { FierySource, FierySystem, FieryOptions, FieryInstance, FieryEntry, FieryData, FieryMap, FieryFields, FieryCacheEntry } from './types'
import { isObject, forEach, createRecord, getFields } from './util'
import { getEntry } from './entry'
import { factory } from './factory'
import { getStoreKey } from './store'
import { removeCacheFromEntry, destroyCache } from './cache'



type DocumentSnapshot = firebase.firestore.DocumentSnapshot
type Firestore = firebase.firestore.Firestore



export function refreshData (cache: FieryCacheEntry, doc: DocumentSnapshot, entry: FieryEntry): FieryData
{
  const system: FierySystem = entry.instance.system
  const options: FieryOptions = entry.options
  const encoded: FieryData = parseDocument(doc, options)
  const decoded: FieryData = decodeData(encoded, options)
  const data: FieryData = cache.data
  const newData: boolean = !cache.doc

  copyData(system, data, decoded)

  cache.doc = doc

  if (newData)
  {
    createRecord(data, entry)
    addSubs(cache, entry)
  }

  return data;
}

export function addSubs (cache: FieryCacheEntry, entry: FieryEntry): void
{
  const options: FieryOptions = entry.options
  const data: FieryData = cache.data
  const doc: DocumentSnapshot | undefined = cache.doc

  if (options.sub && doc)
  {
    for (let subProp in options.sub)
    {
      if (!hasLiveSub(cache, subProp))
      {
        let subOptions: FieryOptions = options.sub[subProp]
        let subName: string = cache.uid + ENTRY_SEPARATOR + subProp

        let subSource: FierySource = subOptions.doc
          ? doc.ref.parent.doc(doc.id + ENTRY_SEPARATOR + subProp)
          : doc.ref.collection(subProp)

        let subEntry: FieryEntry = getEntry(
          entry.instance,
          subSource,
          subOptions,
          subName,
          false // we shouldn't add this to sources
        )

        data[subProp] = factory(subEntry)
        cache.sub[subProp] = subEntry
      }
    }
  }
}

export function hasLiveSub (cache: FieryCacheEntry, sub: string): boolean
{
  return sub in cache.sub && cache.sub[sub].live
}

export function copyData (system: FierySystem, data: FieryData, update: FieryData): FieryData
{
  for (let prop in update)
  {
    if (update.hasOwnProperty(prop))
    {
      system.setProperty(data, prop, update[prop])
    }
  }

  return data
}

export function decodeData (encoded: FieryData, options: FieryOptions): FieryData
{
  if (options.decode)
  {
    encoded = options.decode(encoded)
  }
  else if (options.decoders)
  {
    for (let prop in options.decoders)
    {
      if (prop in encoded)
      {
        encoded[prop] = options.decoders[prop](encoded[prop], encoded)
      }
    }
  }

  return encoded
}

export function encodeData (data: FieryData, options: FieryOptions, fields?: FieryFields): FieryData
{
  const values: FieryData = {}
  const explicit: string[] = getFields(fields, options.include) as string[]

  if (explicit)
  {
    for (let i = 0; i < explicit.length; i++)
    {
      let prop: string = explicit[i]

      if (prop in data)
      {
        values[prop] = data[prop]
      }
    }
  }
  else
  {
    for (let prop in data)
    {
      if (!(prop in options.exclude))
      {
        values[prop] = data[prop]
      }
    }
  }

  if (options.encoders)
  {
    for (let prop in options.encoders)
    {
      if (prop in values)
      {
        values[prop] = options.encoders[prop](values[prop], data)
      }
    }
  }

  return values
}

export function parseDocument (doc: DocumentSnapshot, options: FieryOptions): FieryData
{
  let value = doc.data()
  let out = (isObject(value) ? value : { [options.propValue]: value }) as FieryData

  if (out && options.key)
  {
    out[options.key] = doc.id
  }

  return out
}
