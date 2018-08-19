
import * as firebase from 'firebase'



import { FieryInstance, FieryCacheEntry, FieryOptions, FieryEntry, FieryData, FierySource, FieryChangesCallback, FieryEquality, FieryFields } from './types'
import { parseDocument, encodeData } from './data'
import { forEach, isEqual, isDefined, isFunction, getFields } from './util'
import { getCacheForData, getCacheForReference } from './cache'



type Firestore = firebase.firestore.Firestore
type DocumentReference = firebase.firestore.DocumentReference
type DocumentSnapshot = firebase.firestore.DocumentSnapshot
type CollectionReference = firebase.firestore.CollectionReference



export function update (this: FieryInstance, data: FieryData, fields?: FieryFields): Promise<void> | undefined
{
  const cache: FieryCacheEntry | undefined = getCacheForData(data)

  if (cache && cache.ref)
  {
    const options: FieryOptions = cache.firstEntry.options
    const values: FieryData = encodeData(data, options, fields)

    return cache.ref.update(values)
  }
}

export function sync (this: FieryInstance, data: FieryData, fields?: FieryFields): Promise<void> | undefined
{
  const cache: FieryCacheEntry | undefined = getCacheForData(data)

  if (cache && cache.ref)
  {
    const options: FieryOptions = cache.firstEntry.options
    const values: FieryData = encodeData(data, options, fields)

    return cache.ref.set(values)
  }
}

export function remove (this: FieryInstance, data: FieryData, excludeSubs: boolean = false): Promise<void> | undefined
{
  const cache: FieryCacheEntry | undefined = getCacheForData(data)

  if (cache && cache.ref)
  {
    const options: FieryOptions = cache.firstEntry.options

    if (!excludeSubs && options.sub)
    {
      for (let subProp in options.sub)
      {
        forEach(data[subProp], (sub) =>
        {
          remove.call(this, sub as FieryData)
        })
      }
    }

    return cache.ref.delete()
  }
}

export function clear (this: FieryInstance, data: FieryData, props: FieryFields): Promise<void> | undefined
{
  const cache: FieryCacheEntry | undefined = getCacheForData(data)
  const propsArray: string[] = getFields(props) as string[]

  if (cache && cache.ref)
  {
    const options: FieryOptions = cache.firstEntry.options
    const ref: DocumentReference = cache.ref
    const store: Firestore = ref.firestore

    const deleting: any = {}
    let deleteCount: number = 0

    for (let prop of propsArray)
    {
      if (options.sub && prop in options.sub && data[prop])
      {
        forEach(data[prop], (sub) =>
        {
          remove.call(this, sub as FieryData)
        })
      }
      else if (prop in data)
      {
        let firebaseRuntime: any = (<any>store.app).firebase_

        if (firebaseRuntime)
        {
          deleting[prop] = firebaseRuntime.firestore.FieldValue.delete()
          deleteCount++
        }
      }
    }

    if (deleteCount > 0)
    {
      return ref.update(deleting)
    }
  }
}

export function getChanges (this: FieryInstance,
  data: FieryData,
  fieldsOrCallback: string[] | FieryChangesCallback,
  callbackOrEquality?: FieryChangesCallback | FieryEquality,
  equalityOrNothing?: FieryEquality): Promise<void> | undefined
{
  const cache: FieryCacheEntry | undefined = getCacheForData(data)

  if (cache && cache.ref)
  {
    const fields: FieryFields | undefined = isFunction(fieldsOrCallback) ? undefined : getFields(fieldsOrCallback as FieryFields)
    const callback: FieryChangesCallback = (fields ? callbackOrEquality : fieldsOrCallback) as FieryChangesCallback
    const equality: FieryEquality = ((fields ? equalityOrNothing : callbackOrEquality) || isEqual) as FieryEquality
    const options: FieryOptions = cache.firstEntry.options
    const current: FieryData = encodeData(data, options, fields)

    return cache.ref.get().then((doc: any) =>
    {
      const encoded: FieryData = parseDocument(doc, options)
      const remote: FieryData = {}
      const local: FieryData = {}
      let changes = false

      for (let prop in current)
      {
        let remoteValue = encoded[prop]
        let localValue = current[prop]

        if (!equality(remoteValue, localValue))
        {
          changes = true
          remote[prop] = remoteValue
          local[prop] = localValue
        }
      }

      callback(changes, remote, local)
    })
  }
}

export function ref (this: FieryInstance, data: FieryData, sub?: string): FierySource | undefined
{
  const cache: FieryCacheEntry | undefined = getCacheForData(data)

  if (cache && cache.ref)
  {
    const ref: DocumentReference = cache.ref

    return sub ? ref.collection(sub) : ref
  }
}

export function create (this: FieryInstance, name: string, initial?: FieryData): FieryData | undefined
{
  const built: FieryData | undefined = this.build(name, initial)

  if (built)
  {
    this.sync(built)
  }

  return built
}

export function createSub (this: FieryInstance, data: FieryData, sub: string, initial?: FieryData): FieryData | undefined
{
  const built: FieryData | undefined = this.buildSub(data, sub, initial)

  if (built)
  {
    this.sync(built)
  }

  return built
}

export function build (this: FieryInstance, name: string, initial?: FieryData): FieryData | undefined
{
  if (name in this.entry)
  {
    const entry: FieryEntry = this.entry[name]

    return buildFromCollection (entry.source as CollectionReference, entry, initial)
  }
}

export function buildSub (this: FieryInstance, data: FieryData, sub: string, initial?: FieryData): FieryData | undefined
{
  const cache: FieryCacheEntry | undefined = getCacheForData(data)

  if (cache && cache.ref && sub in cache.sub)
  {
    const entry: FieryEntry = cache.sub[sub]
    const ref: DocumentReference = cache.ref

    return buildFromCollection(ref.collection(sub), entry, initial)
  }
}

export function buildFromCollection (collection: CollectionReference, entry: FieryEntry, initial?: FieryData): FieryData
{
  const options: FieryOptions = entry.options
  const ref = collection.doc()
  const cache: FieryCacheEntry = getCacheForReference(entry, ref)

  if (options.defaults)
  {
    forEach(options.defaults, (defaultValue, prop) =>
    {
      if (initial && !(prop in initial))
      {
        cache.data[prop] = isFunction(defaultValue) ? defaultValue() : defaultValue
      }
    })
  }

  if (initial)
  {
    forEach(initial, (value, prop) =>
    {
      cache.data[prop] = value
    })
  }

  return cache.data
}
