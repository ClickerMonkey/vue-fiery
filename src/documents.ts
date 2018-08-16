
import * as firebase from 'firebase'



import { PROP_UID, UID_SEPARATOR, STORE_SEPARATOR, ENTRY_SEPARATOR } from './constants'
import { FieryOptions, FieryInstance, FieryEntry, FieryData, FieryMap, FieryVue, FieryFields } from './types'
import { isObject, forEach, getMetadata, createRecord, getFields } from './util'
import { closeEntry, getEntry } from './entry'
import { factory } from './factory'
import { getStoreKey } from './store'



type DocumentSnapshot = firebase.firestore.DocumentSnapshot
type Firestore = firebase.firestore.Firestore



export function decodeDocument (encoded: FieryData, options: FieryOptions): FieryData
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

export function encodeDocument (data: FieryData, options: FieryOptions, fields?: FieryFields): FieryData
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

export function refreshDocument (vm: FieryVue, entry: FieryEntry, doc: DocumentSnapshot, data?: FieryData): FieryData
{
  const options: FieryOptions = entry.options
  const property: string | undefined = options.property
  const replace: boolean = !!(options.reset && property)
  const encoded: FieryData = parseDocument(doc, options)
  const decoded: FieryData = decodeDocument(encoded, options)

  if (!data)
  {
    const identifier: string = getDocumentIdentifier(options, doc)

    data = options.newDocument(decoded)
    data[PROP_UID] = identifier

    copyData(vm, data, decoded)
    createRecord(data, entry)

    if (options.sub)
    {
      for (let subProp in options.sub)
      {
        let subOptions: FieryOptions = options.sub[subProp]
        let subEntryKey: string = doc.ref.path + ENTRY_SEPARATOR + subProp
        let subEntry: FieryEntry = getEntry(vm, doc.ref.collection(subProp), subOptions, subEntryKey, true)

        data[subProp] = factory(vm, subEntry)
      }
    }
  }
  else if (replace)
  {
    const replaced: FieryData = options.newDocument(decoded)

    if (options.sub)
    {
      for (let subProp in options.sub)
      {
        if (data[subProp])
        {
          replaced[subProp] = data[subProp]
        }
      }
    }

    createRecord(replaced, entry)

    data = copyData(vm, replaced, decoded)
  }
  else
  {
    copyData(vm, data, decoded)
  }

  return data
}

export function copyData (vm: FieryVue, data: FieryData, update: FieryData): FieryData
{
  for (let prop in update)
  {
    vm.$set(data, prop, update[prop])
  }

  return data
}

export function destroyDocuments (vm: FieryVue, map: FieryMap, fromObject?: FieryMap): void
{
  for (let id in map)
  {
    const old: FieryData = map[id]

    destroyDocument(vm, old)

    if (fromObject)
    {
      vm.$delete(fromObject, id)
    }
  }
}

export function destroyDocument (vm: FieryVue, data: FieryData): void
{
  let { path, options } = getMetadata(data)

  if (options.sub)
  {
    const fiery: FieryInstance = vm.$fiery

    for (let subProp in options.sub)
    {
      let subEntryKey: string = path + ENTRY_SEPARATOR + subProp
      let subEntry: FieryEntry = fiery.entry[ subEntryKey ]

      if (subEntry)
      {
        closeEntry(subEntry)

        delete fiery.entry[ subEntryKey ]

        if (typeof subEntry.index === 'number')
        {
          fiery.entryList[subEntry.index] = null

          delete subEntry.index
        }
      }

      forEach(data[subProp], (value) =>
      {
        destroyDocument(vm, value)
      })
    }
  }
}

export function getDocumentIdentifier (options: FieryOptions, doc: DocumentSnapshot)
{
  return getStoreKey(doc) +
    UID_SEPARATOR +
    options.id +
    UID_SEPARATOR +
    doc.ref.path
}
