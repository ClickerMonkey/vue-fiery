
import * as firebase from 'firebase'


import {
  isObject,
  isFunction,
  isArray,
  isArraySource
} from './util'

import {
  FieryOptions,
  FieryFactory,
  FieryInstanceFactory,
  FieryInstance,
  FieryTarget,
  FieryEntry,
  FieryData,
  FieryMap,
  FierySources,
  FieryMetadata,
  FieryVue,
  FieryExclusions,
  FierySource
} from './types'


type Query = firebase.firestore.Query
type QuerySnapshot = firebase.firestore.QuerySnapshot
type DocumentSnapshot = firebase.firestore.DocumentSnapshot
type DocumentChange = firebase.firestore.DocumentChange
type DocumentReference = firebase.firestore.DocumentReference
type CollectionReference = firebase.firestore.CollectionReference
type Firestore = firebase.firestore.Firestore
type QueryListenOptions = firebase.firestore.QueryListenOptions
type DocumentListenOptions = firebase.firestore.DocumentListenOptions



const PROP_VALUE = '.value'
const PROP_UID = '.uid'
const UID_SEPARATOR = '///'
const ENTRY_SEPARATOR = '/'
const STORE_SEPARATOR = '/'
const RECORD_OPTION_SET = '$set'
const RECORD_OPTION_UPDATE = '$update'
const RECORD_OPTION_REMOVE = '$remove'
const RECORD_OPTION_REF = '$ref'


function destroyDocuments(vm: FieryVue, map: FieryMap, fromObject?: FieryMap): void
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

function factoryInstance(vm: FieryVue): FieryInstanceFactory
{
  return (source: FierySource, options?: Partial<FieryOptions>): FieryTarget => {
    return factory(vm, getEntry(vm, source, options))
  }
}

function factory(vm: FieryVue, entry: FieryEntry): FieryTarget
{
  let chosenFactory = (<any>entry.source).where
    ? (entry.options.map ? factoryMap : factoryCollection)
    : factoryDocument

  return chosenFactory(vm, entry)
}

function factoryMap(vm: FieryVue, entry: FieryEntry): FieryMap
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



function factoryCollection(vm: FieryVue, entry: FieryEntry): FieryData[]
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

function factoryDocument(vm: FieryVue, entry: FieryEntry): FieryData
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

function handleDocumentUpdate(vm: FieryVue, entry: FieryEntry, doc: DocumentSnapshot): void
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

function parseDocument(doc: DocumentSnapshot, options: FieryOptions): FieryData
{
  let value = doc.data()
  let out = (isObject(value) ? value : { [options.propValue]: value }) as FieryData

  if (out && options.key)
  {
    out[options.key] = doc.id
  }

  return out
}

function refreshDocument(vm: FieryVue, entry: FieryEntry, doc: DocumentSnapshot, data?: FieryData): FieryData
{
  const options: FieryOptions = entry.options
  const property: string | undefined = options.property
  const existing: boolean = !!data
  const replace: boolean = !!(options.reset && property)
  const updated: FieryData = parseDocument(doc, options)

  if (!data || replace)
  {
    if (data && options.sub)
    {
      for (let subProp in options.sub)
      {
        if (data[subProp])
        {
          updated[subProp] = data[subProp]
        }
      }
    }

    if (options.type)
    {
      data = copyData(vm, new options.type(), updated)
    }
    else
    {
      data = updated
    }
  }
  else
  {
    copyData(vm, data, updated)
  }

  if (!data[PROP_UID])
  {
    data[PROP_UID] = getDocumentIdentifier(vm, options, doc)
  }

  if (!existing && options.record)
  {
    let recordOptions = options.recordOptions

    if (recordOptions.set) {
      data[recordOptions.set] = function(this: FieryData, fields?: string[]) {
        return set.call(vm, this, fields)
      }
    }

    if (recordOptions.update) {
      data[recordOptions.update] = function(this: FieryData, fields?: string[]) {
        return update.call(vm, this, fields)
      }
    }

    if (recordOptions.remove) {
      data[recordOptions.remove] = function(this: FieryData, excludeSubs: boolean = false) {
        return remove.call(vm, this, excludeSubs)
      }
    }

    if (recordOptions.ref) {
      data[recordOptions.ref] = function(this: FieryData, sub?: string) {
        return ref.call(vm, this, sub)
      }
    }
  }

  if (!existing && options.sub)
  {
    for (let subProp in options.sub)
    {
      let subOptions: FieryOptions = options.sub[subProp]
      let subEntryKey: string = doc.ref.path + ENTRY_SEPARATOR + subProp
      let subEntry: FieryEntry = getEntry(vm, doc.ref.collection(subProp), subOptions, subEntryKey, true)

      data[subProp] = factory(vm, subEntry)
    }
  }

  return data
}

function copyData(vm: FieryVue, data: FieryData, update: FieryData): FieryData
{
  for (let prop in update)
  {
    vm.$set(data, prop, update[prop])
  }

  return data
}

function destroyDocument(vm: FieryVue, data: FieryData): void
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

function forEach(iterable: any, callback: (item: any, key?: number | string, iterable?: any) => any): boolean
{
  if (isArray(iterable))
  {
    for (let i = 0; i < iterable.length; i++)
    {
      callback(iterable[i], i, iterable)
    }

    return true
  }
  else if (isObject(iterable))
  {
    for (let prop in iterable)
    {
      callback(iterable[prop], prop, iterable)
    }

    return true
  }

  return false
}

function getDocumentIdentifier(vm: FieryVue, options: FieryOptions, doc: DocumentSnapshot)
{
  return getStoreKey(vm, doc) +
    UID_SEPARATOR +
    options.id +
    UID_SEPARATOR +
    doc.ref.path
}

function getStoreKey(vm: FieryVue, doc: DocumentSnapshot): number
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

function normalizeOptions(vm: FieryVue, options?: Partial<FieryOptions>, source?: FierySource): FieryOptions
{
  if (!options || !isObject(options))
  {
    options = {}
  }

  if (!isFunction(options.onError))
  {
    options.onError = (message) => {}
  }

  if (!isFunction(options.onMissing))
  {
    options.onMissing = () => {}
  }

  if (!isFunction(options.onSuccess))
  {
    options.onSuccess = (results) => {}
  }

  if (!isFunction(options.onRemove))
  {
    options.onRemove = () => {}
  }

  if (!options.liveOptions)
  {
    options.liveOptions = {}
  }

  if (!options.propValue)
  {
    options.propValue = PROP_VALUE
  }

  if (!options.recordOptions)
  {
    options.recordOptions = {
      set: RECORD_OPTION_SET,
      update: RECORD_OPTION_UPDATE,
      remove: RECORD_OPTION_REMOVE,
      ref: RECORD_OPTION_REF
    }
  }

  if (!options.exclude)
  {
    options.exclude = {}

    if (options.key)
    {
      options.exclude[options.key] = true
    }
  }
  else if (isArray(options.exclude))
  {
    let excludeArray = options.exclude as string[]

    options.exclude = {}

    for (let i = 0; i < excludeArray.length; i++)
    {
      options.exclude[excludeArray[i]] = true
    }
  }

  let excludeMap = options.exclude as FieryExclusions
  excludeMap[options.propValue] = true
  excludeMap[PROP_UID] = true

  if (options.sub)
  {
    for (let subProp in options.sub)
    {
      let subOptions = normalizeOptions(vm, options.sub[subProp] as Partial<FieryOptions>)

      subOptions.property = subProp
      subOptions.parent = options as FieryOptions

      options.sub[subProp] = subOptions
    }
  }

  if (!options.id)
  {
    const fiery: FieryInstance = vm.$fiery

    options.id = ++fiery.optionKeyNext

    fiery.options[options.id] = options as FieryOptions
  }

  return options as FieryOptions
}

function closeEntry(entry: FieryEntry): void
{
  if (entry && entry.off)
  {
    entry.off()

    delete entry.off
  }
}

function getEntry(vm: FieryVue, source: FierySource, optionsInput?: Partial<FieryOptions>, entryKeyInput?: string, useRawOptions: boolean = false)
{
  const options: FieryOptions = useRawOptions
    ? optionsInput as FieryOptions
    : normalizeOptions(vm, optionsInput, source)
  const property: string | undefined = options.property
  const entryKey: string = entryKeyInput || property || ''
  const fiery: FieryInstance = vm.$fiery
  const fires: FierySources = vm.$fires
  const target: FieryTarget = isArraySource(source, options) ? [] : {}

  let existing: FieryEntry | undefined = fiery.entry[ entryKey ]
  let entry: FieryEntry = { source, options, target }

  if (existing)
  {
    closeEntry(existing)

    entry.target = existing.target
  }

  if (!entryKey || !(entryKey in fiery.entry))
  {
    entry.index = fiery.entryList.length

    fiery.entryList.push(entry)
  }

  if (entryKey)
  {
    fiery.entry[ entryKey ] = entry
  }

  if (property)
  {
    fires[ property ] = source
  }

  return entry
}

function getValues(data: FieryData, options: FieryOptions, fields?: string[]): FieryData
{
  const explicit: string[] = fields || options.include
  const values: FieryData = {}

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

  return values
}

function getMetadata(vm: FieryVue, data: FieryData): FieryMetadata
{
  const uid: string = data[PROP_UID]
  const [storeKey, optionKey, path] = uid.split(UID_SEPARATOR)
  const store: Firestore = vm.$fiery.stores[storeKey]
  const options: FieryOptions = vm.$fiery.options[parseInt(optionKey)]

  return { uid, path, storeKey, store, optionKey, options }
}

function update(this: FieryVue, data: FieryData, fields?: string[]): Promise<void> | undefined
{
  const { store, path, options } = getMetadata(this, data)

  if (store && path)
  {
    const values: FieryData = getValues(data, options, fields)

    return store.doc(path).update(values)
  }
}

function set(this: FieryVue, data: FieryData, fields?: string[]): Promise<void> | undefined
{
  const { store, path, options } = getMetadata(this, data)

  if (store && path)
  {
    const values = getValues(data, options, fields)

    return store.doc(path).set(values)
  }
}

function remove(this: FieryVue, data: FieryData, excludeSubs: boolean = false): Promise<void> | undefined
{
  const { store, path, options } = getMetadata(this, data)

  if (store && path)
  {
    if (!excludeSubs && options.sub)
    {
      for (let subProp in options.sub)
      {
        forEach(data[subProp], (sub) =>
        {
          this.remove(sub as FieryData)
        })
      }
    }

    return store.doc(path).delete()
  }
}

function ref(this: FieryVue, data: FieryData, sub?: string): FierySource | undefined
{
  const { store, path } = getMetadata(this, data)

  if (store && path)
  {
    let doc = store.doc(path)

    return sub ? doc.collection(sub) : doc
  }
}

function init(this: FieryVue)
{
  this.$fiery = factoryInstance(this) as FieryInstance
  this.$fiery.stores = {}
  this.$fiery.storeKeyNext = 0
  this.$fiery.storeIdToKey = {}
  this.$fiery.options = {}
  this.$fiery.optionKeyNext = 0
  this.$fiery.entry = {}
  this.$fiery.entryList = []
  this.$fiery.update = update.bind(this)
  this.$fiery.set = set.bind(this)
  this.$fiery.remove = remove.bind(this)
  this.$fiery.ref = ref.bind(this)
  this.$fiery.getMetadata = (data) => getMetadata(this, data)
  this.$fires = {}
}

function destroy(this: FieryVue)
{
  this.$fiery.stores = {}
  this.$fiery.entry = {}
  this.$fiery.entryList.forEach(closeEntry)
  this.$fiery.entryList = []
  this.$fiery = <any>(() => {}) as FieryInstance
  this.$fires = {}
}

function link(this: FieryVue)
{
  const entryList: (FieryEntry | null)[] = this.$fiery.entryList

  for (let i = 0; i < entryList.length; i++)
  {
    const entry: FieryEntry | null = entryList[i]

    if (entry === null)
    {
      continue
    }

    const options: FieryOptions = entry.options

    if (!options.parent && !options.property)
    {
      for (let prop in this)
      {
        if (this[prop] === entry.target)
        {
          options.property = prop

          this.$fiery.entry[ prop ] = entry
          this.$fires[ prop ] = entry.source

          break
        }
      }
    }
  }
}

function install(Vue: any)
{
  Vue.mixin({
    beforeCreate: init,
    created: link,
    beforeDestroy: destroy
  })
}

if (typeof window !== 'undefined' && (<any>window).Vue)
{
  (<any>window).Vue.use(install)
}

export default install
