
import * as firebase from 'firebase'



import { PROP_UID, UID_SEPARATOR, STORE_SEPARATOR, ENTRY_SEPARATOR } from './constants'
import { FieryOptions, FieryInstance, FieryEntry, FieryData, FieryMap, FieryVue } from './types'
import { isObject, forEach, getMetadata, createRecord } from './util'
import { closeEntry, getEntry } from './entry'
import { factory } from './factory'



type DocumentSnapshot = firebase.firestore.DocumentSnapshot
type Firestore = firebase.firestore.Firestore



export function parseDocument(doc: DocumentSnapshot, options: FieryOptions): FieryData
{
  let value = doc.data()
  let out = (isObject(value) ? value : { [options.propValue]: value }) as FieryData

  if (out && options.key)
  {
    out[options.key] = doc.id
  }

  return out
}

export function refreshDocument(vm: FieryVue, entry: FieryEntry, doc: DocumentSnapshot, data?: FieryData): FieryData
{
  const options: FieryOptions = entry.options
  const property: string | undefined = options.property
  const replace: boolean = !!(options.reset && property)
  const encoded: FieryData = parseDocument(doc, options)

  if (!data)
  {
    const identifier: string = getDocumentIdentifier(vm, options, doc)

    data = options.newDocument(encoded)

    data[PROP_UID] = identifier

    copyData(vm, data, encoded)
    createRecord(data, options)

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
    const replaced: FieryData = options.newDocument(encoded)

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

    createRecord(replaced, options)

    data = copyData(vm, replaced, encoded)
  }
  else
  {
    copyData(vm, data, encoded)
  }

  return data
}

export function copyData(vm: FieryVue, data: FieryData, update: FieryData): FieryData
{
  for (let prop in update)
  {
    vm.$set(data, prop, update[prop])
  }

  return data
}

export function destroyDocuments(vm: FieryVue, map: FieryMap, fromObject?: FieryMap): void
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

export function destroyDocument(vm: FieryVue, data: FieryData): void
{
  let { path, options } = getMetadata(vm, data)

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

export function getDocumentIdentifier(vm: FieryVue, options: FieryOptions, doc: DocumentSnapshot)
{
  return getStoreKey(vm, doc) +
    UID_SEPARATOR +
    options.id +
    UID_SEPARATOR +
    doc.ref.path
}

export function getStoreKey(vm: FieryVue, doc: DocumentSnapshot): number
{
  const firestore = (<any>doc)._firestore
  const db = firestore._databaseId
  const id: string = db.database + STORE_SEPARATOR + db.projectId

  const fiery: FieryInstance = vm.$fiery
  let key: number = fiery.storeIdToKey[id]

  if (!key)
  {
    key = ++fiery.storeKeyNext
    fiery.stores[key] = firestore
    fiery.storeIdToKey[id] = key
  }

  return key
}
