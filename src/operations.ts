
import { FieryCacheEntry, FieryOptions, FieryEntry, FieryData, FierySource, FieryChangesCallback, FieryEquality, FieryFields } from './types'
import { parseDocument, encodeData } from './data'
import { forEach, isEqual, isDefined, isFunction, getFields } from './util'
import { getCacheForData } from './cache'



export function update (data: FieryData, fields?: FieryFields): Promise<void> | undefined
{
  const cache: FieryCacheEntry | undefined = getCacheForData(data)

  if (cache && cache.doc)
  {
    const options: FieryOptions = cache.firstEntry.options
    const values: FieryData = encodeData(data, options, fields)

    return cache.doc.ref.update(values)
  }
}

export function sync (data: FieryData, fields?: FieryFields): Promise<void> | undefined
{
  const cache: FieryCacheEntry | undefined = getCacheForData(data)

  if (cache && cache.doc)
  {
    const options: FieryOptions = cache.firstEntry.options
    const values = encodeData(data, options, fields)

    return cache.doc.ref.set(values)
  }
}

export function remove (data: FieryData, excludeSubs: boolean = false): Promise<void> | undefined
{
  const cache: FieryCacheEntry | undefined = getCacheForData(data)

  if (cache && cache.doc)
  {
    const options: FieryOptions = cache.firstEntry.options

    if (!excludeSubs && options.sub)
    {
      for (let subProp in options.sub)
      {
        forEach(data[subProp], (sub) =>
        {
          remove(sub as FieryData)
        })
      }
    }

    return cache.doc.ref.delete()
  }
}

export function clear (data: FieryData, props: FieryFields): Promise<void> | undefined
{
  const cache: FieryCacheEntry | undefined = getCacheForData(data)
  const propsArray: string[] = getFields(props) as string[]

  if (cache && cache.doc)
  {
    const options: FieryOptions = cache.firstEntry.options
    const doc = cache.doc
    const store = doc.ref.firestore

    const deleting: any = {}
    let deleteCount: number = 0

    for (let prop of propsArray)
    {
      if (options.sub && prop in options.sub && data[prop])
      {
        forEach(data[prop], (sub) =>
        {
          remove(sub as FieryData)
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
      return doc.ref.update(deleting)
    }
  }
}

export function getChanges (data: FieryData,
  fieldsOrCallback: string[] | FieryChangesCallback,
  callbackOrEquality?: FieryChangesCallback | FieryEquality,
  equalityOrNothing?: FieryEquality): Promise<void> | undefined
{
  const cache: FieryCacheEntry | undefined = getCacheForData(data)

  if (cache && cache.doc)
  {
    const fields: FieryFields | undefined = isFunction(fieldsOrCallback) ? undefined : getFields(fieldsOrCallback as FieryFields)
    const callback: FieryChangesCallback = (fields ? callbackOrEquality : fieldsOrCallback) as FieryChangesCallback
    const equality: FieryEquality = ((fields ? equalityOrNothing : callbackOrEquality) || isEqual) as FieryEquality
    const options: FieryOptions = cache.firstEntry.options
    const current: FieryData = encodeData(data, options, fields)

    return cache.doc.ref.get().then((doc: any) =>
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

export function ref (data: FieryData, sub?: string): FierySource | undefined
{
  const cache: FieryCacheEntry | undefined = getCacheForData(data)

  if (cache && cache.doc)
  {
    let doc = cache.doc

    return sub ? doc.ref.collection(sub) : doc.ref
  }
}
